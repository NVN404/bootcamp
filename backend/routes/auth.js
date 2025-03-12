const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Patient } = require('../models/user');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, userType: userType || 'User' });
    await user.save();

    res.status(201).json({
      message: 'Signup successful',
      user: { id: user._id, email: user.email, userType: user.userType },
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
      user: { email: user.email, id: user._id, userType: user.userType },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Doctor’s Patients
router.get('/doctor-patients/:doctorId', async (req, res) => {
  try {
    const patients = await Patient.find({ doctorId: req.params.doctorId });
    res.json(patients);
  } catch (error) {
    console.error('Doctor patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Patient Medicines
router.put('/patients/:patientId/medicines', async (req, res) => {
  const { medicines } = req.body;

  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.medicines = medicines; // Replace entire medicines array
    await patient.save();
    res.json({ message: 'Medicines updated', patient });
  } catch (error) {
    console.error('Update medicines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Existing Patient Data Route (for Report.jsx)
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