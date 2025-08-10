// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js'; // <--- NEW: Import prediction routes
import cors from 'cors';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Configure Cloudinary
configureCloudinary();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS
app.use(cors());

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Use authentication routes
app.use('/api/auth', authRoutes);

// Use listing routes
app.use('/api/listings', listingRoutes);

// Use prediction routes
app.use('/api/predict', predictionRoutes); // <--- NEW: Use prediction routes at /api/predict

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});