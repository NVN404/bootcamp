require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const path = require('path');
const { clerkMiddleware } = require('@clerk/express');

const app = express();

// Configure CORS with credentials support
app.use(cors({
  origin: 'http://localhost:3000', // Frontend origin
  credentials: true, // Allow credentials (cookies, authorization headers)
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Clerk Middleware
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  })
);

const mongoURI = 'mongodb://127.0.0.1:27017/yoyo';

async function connectToMongoDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

app.use('/api/auth', authRoutes);

const PORT = 5000;
connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});