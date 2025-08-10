// client/src/components/CreateListingForm.jsx
import React, { useState } from 'react';
import api from '../services/api'; // Our Axios instance
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // To check if user is logged in

const CreateListingForm = ({ onListingCreated }) => {
    const { user } = useAuth(); // Get user from context
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        location: '',
        bhk: '',
        sqft: '',
        description: '',
        category: 'Sell', // Default to Sell
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 4) {
            setError('You can upload a maximum of 4 images.');
            return;
        }
        setImages(files);
        setError(null); // Clear image related error if valid
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        if (!user || !user.token) {
            setError('You must be logged in to create a listing.');
            setLoading(false);
            navigate('/auth'); // Redirect to login
            return;
        }
        if (images.length === 0) {
            setError('Please upload at least one image.');
            setLoading(false);
            return;
        }

        const data = new FormData(); // FormData is required for file uploads
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        images.forEach((image) => {
            data.append('images', image); // 'images' is the field name expected by Multer
        });

        try {
            const response = await api.post('/listings', data, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
            setSuccessMessage('Listing created successfully!');
            // Clear form
            setFormData({
                title: '', price: '', location: '', bhk: '', sqft: '', description: '', category: 'Sell',
            });
            setImages([]);
            // Callback to parent to refresh listings, if provided
            if (onListingCreated) {
                onListingCreated(response.data);
            }
            navigate('/listings'); // Optionally navigate to all listings page
        } catch (err) {
            const errorMessage = err.response && err.response.data.message
                ? err.response.data.message
                : err.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create New Listing</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                    <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                           className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Price</label>
                        <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required
                               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                        <select name="category" id="category" value={formData.category} onChange={handleChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="Sell">Sell</option>
                            <option value="Rent">Rent</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">Location</label>
                        <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required
                               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
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
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} required
                              rows="4" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                </div>
                <div>
                    <label htmlFor="images" className="block text-gray-700 text-sm font-bold mb-2">Images (Max 4)</label>
                    <input type="file" name="images" id="images" multiple onChange={handleImageChange} accept="image/*" required
                           className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {images.length > 0 && (
                        <p className="text-gray-600 text-xs mt-1">Selected: {images.map(img => img.name).join(', ')}</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Add Listing'}
                </button>
            </form>
        </div>
    );
};

export default CreateListingForm;