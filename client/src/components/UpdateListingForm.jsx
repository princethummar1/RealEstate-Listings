// client/src/components/UpdateListingForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UpdateListingForm = ({ listingId, onListingUpdated, onCancel }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        location: '',
        bhk: '',
        sqft: '',
        description: '',
        category: 'Sell',
    });
    const [currentImages, setCurrentImages] = useState([]); // Images already on Cloudinary
    const [newImages, setNewImages] = useState([]); // New files to upload
    const [loading, setLoading] = useState(true); // Loading for initial fetch
    const [submitting, setSubmitting] = useState(false); // Loading for form submission
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Fetch existing listing data on component mount
    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get(`/listings/${listingId}`);
                setFormData({
                    title: data.title,
                    price: data.price,
                    location: data.location,
                    bhk: data.bhk,
                    sqft: data.sqft,
                    description: data.description,
                    category: data.category,
                });
                setCurrentImages(data.images); // Set existing images
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message;
                setError('Failed to load listing for editing: ' + errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (listingId) {
            fetchListing();
        }
    }, [listingId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 4) {
            setError('You can upload a maximum of 4 images.');
            return;
        }
        setNewImages(files);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setSubmitting(true);

        if (!user || !user.token) {
            setError('You must be logged in to update a listing.');
            setSubmitting(false);
            navigate('/auth');
            return;
        }

        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        // Append new images only if selected
        newImages.forEach((image) => {
            data.append('images', image);
        });

        try {
            const response = await api.put(`/listings/${listingId}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccessMessage('Listing updated successfully!');
            // Call parent callback
            if (onListingUpdated) {
                onListingUpdated(response.data);
            }
            // Optionally navigate away or close form
            // navigate('/profile');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center p-6">Loading listing data for editing...</div>;
    }

    if (error && !submitting) { // Show error from initial fetch or submission
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
                <button onClick={onCancel} className="ml-4 text-sm text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Edit Listing</h2>

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
                {/* Current Images Display */}
                {currentImages.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Current Images</label>
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                            {currentImages.map((img, index) => (
                                <img key={index} src={img.url} alt={`Current ${index}`} className="h-24 w-24 object-cover rounded shadow" />
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Uploading new images will replace existing ones.</p>
                    </div>
                )}
                {/* New Images Upload */}
                <div>
                    <label htmlFor="newImages" className="block text-gray-700 text-sm font-bold mb-2">New Images (Max 4, replaces existing)</label>
                    <input type="file" name="newImages" id="newImages" multiple onChange={handleNewImageChange} accept="image/*"
                           className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {newImages.length > 0 && (
                        <p className="text-gray-600 text-xs mt-1">New files: {newImages.map(img => img.name).join(', ')}</p>
                    )}
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={submitting}
                    >
                        {submitting ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateListingForm;