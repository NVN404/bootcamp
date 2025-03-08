const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Patient } = require('../models/user');

const router = express.Router();

// Signup Route (No seeding)
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({
      message: 'Signup successful',
      user: { id: user._id, email: user.email }, // Return userId
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'Successfully logged in',
      user: { email: user.email, id: user._id },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Patient Data Route
router.get('/patients/:userId', async (req, res) => {
  try {
    const patients = await Patient.find({ userId: req.params.userId });
    res.json(patients);
  } catch (error) {
    console.error('Patient data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;