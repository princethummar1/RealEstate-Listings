// server/middleware/multer.js
import multer from 'multer';

// Set up storage (Multer will handle files in memory before Cloudinary upload)
const storage = multer.memoryStorage(); // Stores the file in memory as a Buffer

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    // Check file type (accept jpeg, jpg, png, gif)
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Only image files are allowed!'), false); // Reject file
    }
};

// Initialize Multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit per image
    },
});

// Middleware for handling multiple image uploads (up to 4 images)
// 'images' is the field name that the frontend will use for file uploads
const uploadListingImages = upload.array('images', 4); // Max 4 images

export { uploadListingImages };