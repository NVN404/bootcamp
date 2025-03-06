// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    res.status(400).json({ message: 'Successfully loged in' });
    // Generate JWT token
//     const token = jwt.sign({ email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
//     res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;