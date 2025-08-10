// server/controllers/authController.js
import User from '../models/User.js';
import { registerSchema, loginSchema } from '../utils/joiValidation.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../config/mailer.js'; // This path is correct as per your decision
import { welcomeEmail } from '../utils/emailTemplates.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        // Validate request body with Joi
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            // Joi validation error
            res.status(400);
            return next(new Error(error.details[0].message));
        }

        const { name, email, password } = value;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            return next(new Error('User already exists'));
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password, // Password will be hashed by the pre-save hook in User model
        });

        if (user) {
            // Send welcome email
            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Welcome to Real Estate App!',
                    html: welcomeEmail(user.name),
                });
                console.log(`Welcome email sent to ${user.email}`);
            } catch (emailError) {
                console.error(`Failed to send welcome email to ${user.email}: ${emailError.message}`);
                // Don't block registration, but log the error
            }

            // Respond with user data and token
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                token: generateToken(user._id), // Generate JWT
            });
        } else {
            res.status(400);
            return next(new Error('Invalid user data'));
        }
    } catch (error) {
        next(error); // Pass to general error handler
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        // Validate request body with Joi
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            res.status(400);
            return next(new Error(error.details[0].message));
        }

        const { email, password } = value;

        // Check if user exists
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) { // Use the custom method from User model
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                token: generateToken(user._id),
            });
        } else {
            res.status(401); // Unauthorized
            return next(new Error('Invalid email or password'));
        }
    } catch (error) {
        next(error); // Pass to general error handler
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private (requires token)
const getUserProfile = async (req, res, next) => {
    // req.user is populated by the 'protect' middleware after successful token verification
    const user = await User.findById(req.user._id).select('-password'); // Fetch user, exclude password

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    } else {
        res.status(404); // Not Found
        next(new Error('User not found'));
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private (requires token)
const updateUserProfile = async (req, res, next) => {
    // req.user is populated by the 'protect' middleware
    const user = await User.findById(req.user._id);

    if (user) {
        // Update fields if they are provided in the request body, otherwise keep existing
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.profileImage = req.body.profileImage || user.profileImage; // For updating profile image URL

        // Only update password if a new password is provided in the request body
        if (req.body.password) {
            // The pre-save hook in the User model will automatically hash this new password
            user.password = req.body.password;
        }

        const updatedUser = await user.save(); // Save the updated user document

        // Respond with the updated user data and a new token (good practice if user details like email change)
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImage: updatedUser.profileImage,
            token: generateToken(updatedUser._id), // Generate a new token
        });
    } else {
        res.status(404);
        next(new Error('User not found'));
    }
};

// IMPORTANT: Export all the controller functions that are meant to be used in routes
export { registerUser, loginUser, getUserProfile, updateUserProfile };