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
  updatedAt: { type: Date, default: Date.now },
});

// Ensure updatedAt is updated on every save
patientSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// New Schema for Medicine Intake History
const medicineIntakeSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medicineName: { type: String, required: true },
  date: { type: Date, required: true },
  taken: { type: Boolean, required: true }, // Yes (true) or No (false)
  frequency: { type: Number, default: 0 }, // Tracks daily frequency
});

const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);
const MedicineIntake = mongoose.model('MedicineIntake', medicineIntakeSchema);

module.exports = { User, Patient, MedicineIntake };