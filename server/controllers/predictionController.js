// server/controllers/predictionController.js
import Joi from 'joi';
import axios from 'axios';

// Joi Schema for prediction input validation
const predictionSchema = Joi.object({
    location: Joi.string().min(3).required().messages({
        'string.empty': 'Location cannot be empty',
        'any.required': 'Location is required',
    }),
    bhk: Joi.number().integer().min(1).required().messages({
        'number.base': 'BHK must be a number',
        'number.integer': 'BHK must be an integer',
        'number.min': 'BHK must be at least 1',
        'any.required': 'BHK is required',
    }),
    sqft: Joi.number().min(100).required().messages({
        'number.base': 'Square footage must be a number',
        'number.min': 'Square footage must be at least 100',
        'any.required': 'Square footage is required',
    }),
    furnishing_status: Joi.string()
        .valid('Furnished', 'Semi-Furnished', 'Unfurnished') // Ensure these match your dataset's exact casing
        .required()
        .messages({
            'any.only':
                'Furnishing status must be "Furnished", "Semi-Furnished", or "Unfurnished"',
            'any.required': 'Furnishing status is required',
        }),
    property_type: Joi.string()
        .valid(
            'Apartment',
            'Residential Plot',
            'Independent Floor',
            'Independent House',
            'Villa'
        ) // Ensure these match your dataset's exact casing
        .required()
        .messages({
            'any.only':
                'Property type must be "Apartment", "Residential Plot", "Independent Floor", "Independent House", or "Villa"',
            'any.required': 'Property type is required',
        }),
});


// @desc    Get property price prediction from Django ML service
// @route   POST /api/predict
// @access  Public
const getPricePrediction = async (req, res, next) => {
    try {
        // 1. Validate request
        const { error, value } = predictionSchema.validate(req.body);
        if (error) {
            res.status(400);
            return next(new Error(error.details[0].message));
        }

        // 2. Build payload for Django
        const dataToSendToDjango = {
            location: value.location,
            bhk: value.bhk,
            sqft: value.sqft,
            furnishing_status: value.furnishing_status,
            property_type: value.property_type,
        };

        // --- DEBUGGING LINE ---
        console.log(
            'Node.js: Sending prediction request to Django:',
            'http://127.0.0.1:8000/api/predict/',
            dataToSendToDjango
        );
        // --- END DEBUGGING LINE ---

        // 3. Call Django
        const djangoResponse = await axios.post(
            'http://127.0.0.1:8000/api/predict/', // Target IPv4 loopback explicitly
            dataToSendToDjango,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                family: 4, // <--- CRITICAL: Forces Node.js to use IPv4
            }
        );

        // 4. Forward response
        return res.status(djangoResponse.status).json(djangoResponse.data);
    } catch (error) {
        // --- DETAILED ERROR LOGGING ---
        console.error('Node.js: Full Axios Error:', error);
        console.error(
            'Node.js: Error calling Django prediction service:',
            error.message
        );
        if (error.response) {
            // Django returned an error status
            console.error('Django Error Response:', error.response.data);
            res.status(error.response.status);
            return next(
                new Error(
                    error.response.data.error ||
                        'Prediction service error'
                )
            );
        } else if (error.request) {
            // Request made but no response
            res.status(503);
            return next(
                new Error(
                    'Prediction service is unavailable. Please ensure Django server is running.'
                )
            );
        } else {
            // Something else
            res.status(500);
            return next(
                new Error(
                    'An unexpected error occurred while requesting prediction.'
                )
            );
        }
    }
};

export { getPricePrediction };