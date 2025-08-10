// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    let token;

    console.log('--- PROTECT MIDDLEWARE HIT ---'); // Added for debugging

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token received:', token); // Added for debugging

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded Token ID:', decoded.id); // Added for debugging

            req.user = await User.findById(decoded.id).select('-password');
            console.log('User found (req.user):', req.user ? req.user.email : 'No user found'); // Added for debugging
            next();
        } catch (error) {
            console.error('Not authorized, token failed:', error.message);
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    }

    if (!token) {
        console.log('No token provided in Authorization header.'); // Added for debugging
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
    console.log('--- PROTECT MIDDLEWARE END ---'); // Added for debugging
};

export { protect };