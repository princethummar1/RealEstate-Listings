// server/utils/joiValidation.js
import Joi from 'joi';

// Schema for user registration
const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
        'string.base': 'Name should be a type of text',
        'string.empty': 'Name cannot be an empty field',
        'string.min': 'Name should have a minimum length of {#limit}',
        'string.max': 'Name should have a maximum length of {#limit}',
        'any.required': 'Name is a required field',
    }),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'in'] } }).required().messages({
        'string.email': 'Email must be a valid email',
        'string.empty': 'Email cannot be an empty field',
        'any.required': 'Email is a required field',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least {#limit} characters long',
        'string.empty': 'Password cannot be an empty field',
        'any.required': 'Password is a required field',
    }),
});

// Schema for user login
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email',
        'string.empty': 'Email cannot be an empty field',
        'any.required': 'Email is a required field',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password cannot be an empty field',
        'any.required': 'Password is a required field',
    }),
});

export { registerSchema, loginSchema };