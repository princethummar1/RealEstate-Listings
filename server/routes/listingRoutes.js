// server/routes/listingRoutes.js
import express from 'express';
import {
    createListing,
    getListings,
    getSingleListing,
    updateListing,
    deleteListing
} from '../controllers/listingController.js';
import { protect } from '../middleware/authMiddleware.js'; // Import protect middleware

const router = express.Router();

// Public routes
// GET /api/listings (for all listings or by userId)
// GET /api/listings/:id (for a single listing)
router.route('/').get(getListings);
router.route('/:id').get(getSingleListing);

// Private routes (require authentication)
// POST /api/listings (create new listing)
router.route('/').post(protect, createListing);

// PUT /api/listings/:id (update existing listing)
// DELETE /api/listings/:id (delete existing listing)
router.route('/:id')
    .put(protect, updateListing)
    .delete(protect, deleteListing);

export default router;