// client/src/pages/Prediction.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Our Axios instance

const Prediction = () => {
    const [formData, setFormData] = useState({
        location: 'Ahmedabad', // Default value
        bhk: 2,               // Default value
        sqft: 1000,           // Default value
        furnishing_status: 'Unfurnished', // Default value
        property_type: 'Apartment', // Default value
    });
    const [predictedPrice, setPredictedPrice] = useState(null);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hardcode available options based on your model's training data
    // Ensure these lists match the values in your Jupyter Notebook's LabelEncoders
    const availableLocations = ['Ahmedabad', 'Bangalore', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Mumbai', 'Pune']; // Example, get from your location_encoder.classes_
    const availableFurnishingStatus = ['Unfurnished', 'Semi-Furnished', 'Furnished']; // Example, get from furnishing_encoder.classes_
    const availablePropertyTypes = ['Apartment', 'Independent Floor', 'Independent House', 'Residential Plot', 'Villa']; // Example, get from your one_hot_cols.pkl (without PropertyType_ prefix)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPredictedPrice(null);
        setDetails(null);

        try {
            // Send request to Node.js backend /api/predict endpoint
            const { data } = await api.post('/predict', formData);
            setPredictedPrice(data.predictedPrice);
            setDetails(data.details);
        } catch (err) {
            const errorMessage = err.response && err.response.data.error // From Django errors
                ? err.response.data.error
                : err.response && err.response.data.message // From Node.js Joi/other errors
                ? err.response.data.message
                : err.message;
            setError('Prediction failed: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 my-8">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Property Price Prediction</h1>

            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Enter Property Details</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">Location</label>
                        <select name="location" id="location" value={formData.location} onChange={handleChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            {availableLocations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="bhk" className="block text-gray-700 text-sm font-bold mb-2">BHK</label>
                            <input type="number" name="bhk" id="bhk" value={formData.bhk} onChange={handleChange} required
                                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label htmlFor="sqft" className="block text-gray-700 text-sm font-bold mb-2">Sqft</label>
                            <input type="number" name="sqft" id="sqft" value={formData.sqft} onChange={handleChange} required
                                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="furnishing_status" className="block text-gray-700 text-sm font-bold mb-2">Furnishing Status</label>
                        <select name="furnishing_status" id="furnishing_status" value={formData.furnishing_status} onChange={handleChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            {availableFurnishingStatus.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="property_type" className="block text-gray-700 text-sm font-bold mb-2">Property Type</label>
                        <select name="property_type" id="property_type" value={formData.property_type} onChange={handleChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            {availablePropertyTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loading}
                    >
                        {loading ? 'Predicting...' : 'Get Prediction'}
                    </button>
                </form>
            </div>

            {predictedPrice !== null && (
                <div className="max-w-3xl mx-auto bg-green-50 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-green-800">Predicted Price:</h2>
                    <p className="text-4xl font-bold text-green-700">
                        ₹{predictedPrice.toLocaleString('en-IN')}
                    </p>
                    {details && <p className="text-gray-700 mt-2">{details}</p>}
                    <p className="text-sm text-gray-500 mt-4">
                        (This prediction is based on the trained ML model.)
                    </p>
                </div>
            )}
        </div>
    );
};

export default Prediction;