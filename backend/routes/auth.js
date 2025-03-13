const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Patient } = require('../models/user');

const router = express.Router();

// Signup Route (No seeding)
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

    patient.medicines = medicines;
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

// New Route: Add Patient to Doctor
router.post('/doctor/:doctorId/add-patient', async (req, res) => {
  const { doctorId } = req.params;
  const { email, name, patientId } = req.body;

  try {
    const patientUser = await User.findOne({ email });
    if (!patientUser || patientUser.userType !== 'User') {
      return res.status(404).json({ message: 'Patient not found or not a valid user' });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.userType !== 'Doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const existingPatient = await Patient.findOne({ userId: patientUser._id, doctorId });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient already assigned to this doctor' });
    }

    const newPatient = new Patient({
      userId: patientUser._id,
      doctorId,
      patientId: patientId || `PAT-${Date.now()}`,
      name: name || patientUser.email.split('@')[0],
      medicines: [],
    });

    await newPatient.save();
    res.status(201).json({ message: 'Patient added successfully', patient: newPatient });
  } catch (error) {
    console.error('Add patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Patient by _id
router.get('/patients/by-id/:patientId', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Patient fetch by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Medicines by userId
router.put('/patients/by-user/:userId/medicines', async (req, res) => {
  const { medicines } = req.body;

  try {
    const patient = await Patient.findOne({ userId: req.params.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.medicines = medicines;
    await patient.save();
    res.json({ message: 'Medicines updated', patient });
  } catch (error) {
    console.error('Update medicines by userId error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// New Route: Fetch Latest Patient by userId
router.get('/patients/latest/:userId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.userId })
      .sort({ updatedAt: -1 }); // Sort by most recent update
    if (!patient) {
      return res.status(404).json({ message: 'No patient data found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Fetch latest patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;