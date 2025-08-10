// server/routes/predictionRoutes.js
import express from 'express';
import { getPricePrediction } from '../controllers/predictionController.js';

const router = express.Router();

// Public route for price prediction
router.post('/', getPricePrediction);

export default router; // THIS MUST BE PRESENT AND UNCOMMENTED