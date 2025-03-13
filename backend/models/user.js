const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['User', 'Doctor'], default: 'User' },
});

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  frequency: { type: Number, required: true },
  dose: { type: String, default: '1 tablet' },
  time: { type: String, default: '08:00' },
});

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientId: { type: String, required: true },
  name: { type: String, required: true },
  medicines: [medicineSchema],
  updatedAt: { type: Date, default: Date.now }, // Added updatedAt field
});

// Ensure updatedAt is updated on every save
patientSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);

module.exports = { User, Patient };