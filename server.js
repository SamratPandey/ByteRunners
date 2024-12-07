const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();

// Connect to the database
connectDB();

// Enable CORS for specific origin (your frontend URL)
app.use(cors({
  origin: 'http://localhost:5173',  // Allow requests from the frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow headers
  credentials: true,  // Allow cookies and credentials
}));

// Parse JSON requests
app.use(express.json());

// Authentication routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
