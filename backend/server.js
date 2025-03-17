const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const path = require('path');
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Clerk Middleware for Authentication
app.use(ClerkExpressWithAuth({
  clerkSecretKey: 'sk_test_WmNplRBUeT47dn0vPRVqGx5tlLzhp6FJ2EDkNJmKDZ', // Replace with your Clerk Secret Key
}));

// MongoDB Connection
const mongoURI = 'mongodb://127.0.0.1:27017/yoyo';

async function connectToMongoDB() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Routes
app.use('/api/auth', authRoutes);

// Start Server
const PORT = 5000;
connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});