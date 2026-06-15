const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // For local assessment, allow requests from any origin (or define React port later)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded profile photos statically
// Allows browser to fetch at: http://localhost:5000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route checking API status
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Management System API is running smoothly.'
  });
});

// Import and mount student routes
const studentRoutes = require('./routes/studentRoutes');
app.use('/students', studentRoutes);

// Global Error Handling Middleware (handles Multer errors and others)
app.use((err, req, res, next) => {
  console.error('API Error Encountered:', err);
  
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize Database DDL and start listening on specified port
const startServer = async () => {
  try {
    // Run DB schemas migrations and seed initial records if empty
    await db.initDb();
    
    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`  Backend Server is actively listening on Port ${PORT} `);
      console.log(`  Health Check: http://localhost:${PORT}/             `);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Server failed to start due to database errors:', error);
    process.exit(1);
  }
};

startServer();
