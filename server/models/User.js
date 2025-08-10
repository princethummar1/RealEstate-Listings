// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // For password hashing

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true, // Ensures email is unique
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        profileImage: {
            type: String,
            default: 'https://res.cloudinary.com/dm9ssuwao/image/upload/v1721759021/default-profile.png' // Default image if not provided
            // You can replace this with your own default image URL from Cloudinary
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // Only hash if password is new or modified
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;