const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection (Replace with your connection string if using MongoDB Atlas)
mongoose.connect('mongodb://127.0.0.1:27017/assignmentDB')
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// 1. POST Endpoint: Create User
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

// 2. GET Endpoint: Read all Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
// Redirect root URL to index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});