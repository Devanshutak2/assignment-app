const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// 1. Configure CORS for Express
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 2. Configure CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 3. Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 4. Define Mongoose User Schema & Model
const userSchema = new mongoose.Schema({
  mobileNo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  loginId: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Helper function: Check if string contains only alphabetic characters & spaces
const isAlphabetic = (str) => /^[a-zA-A\s]+$/.test(str);

// 5. REST API Routes

// GET / - Health Check
app.get('/', (req, res) => {
  res.send('User Management API is running...');
});

// POST /api/users - Save New User (Task 1)
app.post('/api/users', async (req, res) => {
  try {
    const { mobileNo, email, street, city, state, country, loginId, password } = req.body;

    // Validate required fields
    if (!mobileNo || !email || !street || !city || !state || !country || !loginId || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Alphabetic field validations (City, State, Country)
    if (!isAlphabetic(city) || !isAlphabetic(state) || !isAlphabetic(country)) {
      return res.status(400).json({ error: 'City, State, and Country must contain alphabetic characters only.' });
    }

    // Check if user with same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const newUser = new User({
      mobileNo,
      email,
      street,
      city,
      state,
      country,
      loginId,
      password
    });

    await newUser.save();

    // Broadcast new user insertion in real-time via Socket.io (Task 2)
    io.emit('userJoined', newUser);

    return res.status(201).json({ message: 'User saved successfully!', user: newUser });
  } catch (error) {
    console.error('Error saving user:', error);
    return res.status(500).json({ error: 'Internal server error while saving user.' });
  }
});

// GET /api/users - Fetch All Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error while fetching users.' });
  }
});

// GET /api/users/email/:email - Fetch User Details by Email
app.get('/api/users/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// 6. Socket.io Connection Logic (Task 2 Live Room)
let activeUsers = 0;

io.on('connection', (socket) => {
  activeUsers++;
  console.log(`New user connected. Active users: ${activeUsers}`);

  // Broadcast current active count to all connected clients
  io.emit('activeCountUpdate', activeUsers);

  socket.on('disconnect', () => {
    activeUsers = Math.max(0, activeUsers - 1);
    console.log(`User disconnected. Active users: ${activeUsers}`);
    io.emit('activeCountUpdate', activeUsers);
  });
});

// 7. Start Server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
