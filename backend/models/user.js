const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, default: 'User' },
});

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., Aspirin, Paracetamol, Dolo650
  frequency: { type: Number, required: true } // Number of times taken
});

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: String, required: true },
  medicines: [medicineSchema] // Array of medicines with frequencies
});

const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);

module.exports = { User, Patient };