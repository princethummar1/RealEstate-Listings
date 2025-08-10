// server/routes/authRoutes.js
import express from 'express';
// <--- NEW: Import protect middleware and new controller functions
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for authentication
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes for profile management (require 'protect' middleware)
// This is a concise way to define routes that share the same path
router.route('/profile')
    .get(protect, getUserProfile)      // GET /api/auth/profile (protected by 'protect' middleware)
    .put(protect, updateUserProfile);  // PUT /api/auth/profile (protected by 'protect' middleware)

export default router;