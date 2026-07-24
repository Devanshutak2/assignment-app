const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/assignmentDB';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Task 2: Maintain Live Users in Local Variable ---
let liveUsersList = [];

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // 1. Join room "live_users" after data is inserted in MongoDB
  socket.on('join_live_users', (userData) => {
    socket.join('live_users');

    // 2. Maintain email id, name, and socket id in local variable
    const userInfo = {
      socketId: socket.id,
      email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`
    };

    liveUsersList = liveUsersList.filter(u => u.socketId !== socket.id);
    liveUsersList.push(userInfo);

    // Broadcast updated live users array to room
    io.to('live_users').emit('update_live_users', liveUsersList);
  });

  // Automatically register page viewers to the room
  socket.on('register_viewer', () => {
    socket.join('live_users');
    socket.emit('update_live_users', liveUsersList);
  });

  socket.on('disconnect', () => {
    liveUsersList = liveUsersList.filter(u => u.socketId !== socket.id);
    io.to('live_users').emit('update_live_users', liveUsersList);
  });
});

// --- REST APIs ---

// Save User Endpoint
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json({ success: true, message: 'User saved successfully!', data: savedUser });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// GET Endpoint for Popup Modal (Fetch user details by email)
app.get('/api/users/by-email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// GET Endpoint for All Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
