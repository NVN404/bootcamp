const express = require('express');
const { User, Patient, MedicineIntake } = require('../models/user');

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Get Doctor’s Patients
router.get('/doctor-patients/:doctorId', requireAuth, async (req, res) => {
  try {
    const patients = await Patient.find({ doctorId: req.params.doctorId });
    res.json(patients);
  } catch (error) {
    console.error('Doctor patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Patient Medicines
router.put('/patients/:patientId/medicines', requireAuth, async (req, res) => {
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
router.get('/patients/:userId', requireAuth, async (req, res) => {
  try {
    const patients = await Patient.find({ userId: req.params.userId });
    res.json(patients);
  } catch (error) {
    console.error('Patient data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Patient to Doctor
router.post('/doctor/:doctorId/add-patient', requireAuth, async (req, res) => {
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
router.get('/patients/by-id/:patientId', requireAuth, async (req, res) => {
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
router.put('/patients/by-user/:userId/medicines', requireAuth, async (req, res) => {
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

// Fetch Latest Patient by userId
router.get('/patients/latest/:userId', requireAuth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.userId }).sort({ updatedAt: -1 });
    if (!patient) {
      return res.status(404).json({ message: 'No patient data found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Fetch latest patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Record Medicine Intake
router.post('/medicine-intake', requireAuth, async (req, res) => {
  const { patientId, medicineName, taken } = req.body;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let intake = await MedicineIntake.findOne({
      patientId,
      medicineName,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });
    if (intake) {
      intake.taken = taken;
      intake.frequency = taken ? intake.frequency + 1 : Math.max(0, intake.frequency - 1);
      await intake.save();
    } else {
      intake = new MedicineIntake({
        patientId,
        medicineName,
        date: today,
        taken,
        frequency: taken ? 1 : 0,
      });
      await intake.save();
    }
    res.status(201).json({ message: 'Medicine intake recorded', intake });
  } catch (error) {
    console.error('Record medicine intake error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Medicine Intake History
router.get('/medicine-intake/:patientId', requireAuth, async (req, res) => {
  try {
    const intakes = await MedicineIntake.find({ patientId: req.params.patientId }).sort({ date: -1 });
    res.json(intakes);
  } catch (error) {
    console.error('Fetch medicine intake error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;