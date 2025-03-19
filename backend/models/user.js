const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a sub-schema for medicines
const medicineSchema = new Schema({
  name: { type: String, required: true },
  dose: { type: String, required: true },
  times: { type: [String], required: true }, // Changed from 'time' to 'times' array
  frequency: { type: Number, required: true },
  timeLeft: { type: Number, default: 0 } // Optional, calculated client-side
});

// Patient Schema
const patientSchema = new Schema({
  userId: { type: String, required: true },
  doctorId: { type: String, required: true },
  patientId: { type: String, unique: true },
  name: { type: String, required: true },
  medicines: [medicineSchema], // Use the sub-schema here
}, { timestamps: true });

// MedicineIntake Schema (unchanged)
const medicineIntakeSchema = new Schema({
  patientId: { type: String, required: true },
  medicineName: { type: String, required: true },
  date: { type: Date, required: true },
  taken: { type: Boolean, required: true },
  frequency: { type: Number, default: 0 },
}, { timestamps: true });

// User Schema (unchanged)
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  userType: { type: String, enum: ['Doctor', 'User'], required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);
const MedicineIntake = mongoose.model('MedicineIntake', medicineIntakeSchema);

module.exports = { User, Patient, MedicineIntake };