// server/controllers/listingController.js
import Listing from '../models/Listing.js';
import { cloudinary } from '../config/cloudinary.js'; // Import cloudinary object
import { uploadListingImages } from '../middleware/multer.js'; // Import Multer middleware
import Joi from 'joi'; // Re-import Joi for listing validation

// Joi Schema for listing creation/update validation
const listingSchema = Joi.object({
    title: Joi.string().min(5).max(100).required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().min(3).required(),
    bhk: Joi.number().integer().min(1).required(),
    sqft: Joi.number().min(100).required(),
    description: Joi.string().min(20).max(1000).required(),
    category: Joi.string().valid('Sell', 'Rent').required(),
    // Images are handled separately by Multer and Cloudinary, not directly validated here
});

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (requires token)
const createListing = async (req, res, next) => {
    // Multer middleware (uploadListingImages) will parse files and body
    uploadListingImages(req, res, async (err) => {
        if (err) {
            res.status(400);
            return next(new Error(err.message));
        }

        try {
            // Validate request body using Joi (excluding images as Multer handles them)
            const { error, value } = listingSchema.validate(req.body);
            if (error) {
                res.status(400);
                return next(new Error(error.details[0].message));
            }

            // Check if files were uploaded by Multer
            if (!req.files || req.files.length === 0) {
                res.status(400);
                return next(new Error('At least one image is required for a listing.'));
            }

            const images = [];
            // Upload images to Cloudinary
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
                    folder: 'real_estate_listings', // Folder in Cloudinary
                });
                images.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }

            // Create the listing
            const listing = await Listing.create({
                ...value, // Joi validated body data
                user: req.user._id, // User ID from 'protect' middleware
                images: images,
            });

            res.status(201).json(listing);
        } catch (error) {
            next(error);
        }
    });
};

// @desc    Get all listings (or listings by a specific user if query param is present)
// @route   GET /api/listings
// @access  Public (or Private if getting user-specific listings)
const getListings = async (req, res, next) => {
    try {
        const userId = req.query.userId; // Check for a userId query parameter

        let listings;
        if (userId) {
            // If userId is provided, fetch listings by that user
            listings = await Listing.find({ user: userId }).populate('user', 'name email profileImage');
        } else {
            // Otherwise, fetch all listings
            listings = await Listing.find({}).populate('user', 'name email profileImage');
        }
        res.status(200).json(listings);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getSingleListing = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id).populate('user', 'name email profileImage');

        if (!listing) {
            res.status(404);
            return next(new Error('Listing not found'));
        }
        res.status(200).json(listing);
    } catch (error) {
        next(error);
    }
};


// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private (requires token & owner)
const updateListing = async (req, res, next) => {
    uploadListingImages(req, res, async (err) => {
        if (err) {
            res.status(400);
            return next(new Error(err.message));
        }

        try {
            const { id } = req.params; // Listing ID from URL
            const userId = req.user._id; // Authenticated user ID

            // Find listing
            let listing = await Listing.findById(id);

            if (!listing) {
                res.status(404);
                return next(new Error('Listing not found'));
            }

            // Check if logged-in user is the owner of the listing
            if (listing.user.toString() !== userId.toString()) {
                res.status(401); // Unauthorized
                return next(new Error('Not authorized to update this listing'));
            }

            // Validate updated body data (excluding images)
            const { error, value } = listingSchema.validate(req.body);
            if (error) {
                res.status(400);
                return next(new Error(error.details[0].message));
            }

            const updatedFields = { ...value };
            let newImages = [];

            // If new files are uploaded, handle them
            if (req.files && req.files.length > 0) {
                // Delete old images from Cloudinary
                for (const image of listing.images) {
                    await cloudinary.uploader.destroy(image.public_id);
                }

                // Upload new images to Cloudinary
                for (const file of req.files) {
                    const result = await cloudinary.uploader.upload(file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
                        folder: 'real_estate_listings',
                    });
                    newImages.push({
                        public_id: result.public_id,
                        url: result.secure_url,
                    });
                }
                updatedFields.images = newImages; // Assign new images
            } else {
                // If no new files, retain existing images if not explicitly removed
                updatedFields.images = listing.images;
            }


            // Update the listing
            listing = await Listing.findByIdAndUpdate(id, updatedFields, {
                new: true, // Return the updated document
                runValidators: true, // Run schema validators
            }).populate('user', 'name email profileImage'); // Populate user info on updated listing

            res.status(200).json(listing);

        } catch (error) {
            next(error);
        }
    });
};


// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private (requires token & owner)
const deleteListing = async (req, res, next) => {
    try {
        const { id } = req.params; // Listing ID from URL
        const userId = req.user._id; // Authenticated user ID

        const listing = await Listing.findById(id);

        if (!listing) {
            res.status(404);
            return next(new Error('Listing not found'));
        }

        // Check if logged-in user is the owner of the listing
        if (listing.user.toString() !== userId.toString()) {
            res.status(401); // Unauthorized
            return next(new Error('Not authorized to delete this listing'));
        }

        // Delete images from Cloudinary first
        for (const image of listing.images) {
            await cloudinary.uploader.destroy(image.public_id);
        }

        await Listing.deleteOne({ _id: id }); // Use deleteOne to remove the document

        res.status(200).json({ message: 'Listing removed' });
    } catch (error) {
        next(error);
    }
};

export { createListing, getListings, getSingleListing, updateListing, deleteListing };