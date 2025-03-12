const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['User', 'Doctor'], default: 'User' }, // Add Doctor type
});

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  frequency: { type: Number, required: true },
  dose: { type: String, default: '1 tablet' }, // Added for Reminder
  time: { type: String, default: '08:00' },   // Added for Reminder
});

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Patient’s user ID
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },              // Doctor’s user ID
  patientId: { type: String, required: true }, // Unique patient identifier
  name: { type: String, required: true },      // Patient name for display
  medicines: [medicineSchema],                 // Array of medicines
});

const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);

module.exports = { User, Patient };