// server/models/Listing.js
import mongoose from 'mongoose';

const listingSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId, // Link to the User who created the listing
            required: true,
            ref: 'User', // References the 'User' model
        },
        title: {
            type: String,
            required: [true, 'Please add a title for the listing'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
            min: [0, 'Price cannot be negative'],
        },
        location: {
            type: String,
            required: [true, 'Please add a location'],
            trim: true,
        },
        bhk: {
            type: Number,
            required: [true, 'Please specify BHK (Bedrooms, Hall, Kitchen)'],
            min: [1, 'BHK must be at least 1'],
        },
        sqft: {
            type: Number,
            required: [true, 'Please add square footage'],
            min: [100, 'Square footage must be at least 100'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [1000, 'Description cannot be more than 1000 characters'],
        },
        category: { // Sell or Rent
            type: String,
            required: [true, 'Please specify category (Sell/Rent)'],
            enum: ['Sell', 'Rent'], // Only allows these two values
        },
        images: [ // Array of image URLs from Cloudinary
            {
                public_id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;