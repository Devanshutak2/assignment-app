const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Enable CORS for Vercel and local testing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('public'));

// Configure Socket.io with permissive CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// MongoDB Atlas Connection
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_ATLAS_CONNECTION_STRING_HERE';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Mongoose User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobileNo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: '' },
  loginId: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Root Route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// GET /api/users - Fetch All Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users from database.' });
  }
});

// POST /api/users - Create/Save User
app.post('/api/users', async (req, res) => {
  try {
    const { 
      firstName, lastName, mobileNo, email, 
      street, city, state, country, address, 
      loginId, password 
    } = req.body;

    // Normalize nested or flat address fields
    const finalStreet = street || (address && address.street) || '';
    const finalCity = city || (address && address.city) || '';
    const finalState = state || (address && address.state) || '';
    const finalCountry = country || (address && address.country) || '';

    // Validate Required Fields
    if (!firstName || !lastName || !mobileNo || !email || !loginId || !password) {
      return res.status(400).json({ error: 'First Name, Last Name, Mobile, Email, Login ID, and Password are required.' });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered. Please use another email.' });
    }

    const newUser = new User({
      firstName,
      lastName,
      mobileNo,
      email,
      street: finalStreet,
      city: finalCity,
      state: finalState,
      country: finalCountry,
      loginId,
      password
    });

    await newUser.save();

    // Broadcast event to Socket.io clients
    io.emit('userJoined', newUser);

    return res.status(201).json({ 
      message: 'User saved successfully!', 
      user: newUser 
    });

  } catch (error) {
    console.error('Error saving user:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error.' });
  }
});

// Socket.io Connection Events
io.on('connection', (socket) => {
  console.log('Client connected to socket:', socket.id);

  socket.on('join_live_users', (data) => {
    io.emit('userJoined', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from socket:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
