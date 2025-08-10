// client/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import UpdateListingForm from '../components/UpdateListingForm'; // <--- NEW: Import UpdateListingForm

const Profile = () => {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        profileImage: user?.profileImage || '',
        password: '',
        confirmPassword: '',
    });
    const [userListings, setUserListings] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingListings, setLoadingListings] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileImageFile, setProfileImageFile] = useState(null);

    // <--- NEW STATE FOR EDITING LISTING -->
    const [editingListingId, setEditingListingId] = useState(null); // Stores the ID of the listing being edited

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }

        const fetchProfile = async () => {
            setLoadingProfile(true);
            try {
                const { data } = await api.get('/auth/profile');
                setProfileData({
                    name: data.name,
                    email: data.email,
                    profileImage: data.profileImage,
                    password: '',
                    confirmPassword: '',
                });
            } catch (err) {
                setError('Failed to fetch profile: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoadingProfile(false);
            }
        };

        const fetchUserListings = async () => {
            setLoadingListings(true);
            try {
                const { data } = await api.get(`/listings?userId=${user._id}`);
                setUserListings(data);
            } catch (err) {
                setError('Failed to fetch your listings: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoadingListings(false);
            }
        };

        fetchProfile();
        fetchUserListings();
    }, [user, navigate]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleProfileImageChange = (e) => {
        setProfileImageFile(e.target.files[0]);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoadingProfile(true);

        const data = new FormData();
        data.append('name', profileData.name);
        data.append('email', profileData.email);
        if (profileData.password) {
            if (profileData.password !== profileData.confirmPassword) {
                setError('Passwords do not match.');
                setLoadingProfile(false);
                return;
            }
            data.append('password', profileData.password);
        }
        if (profileImageFile) {
            data.append('profileImage', profileImageFile);
        }

        try {
            const { data: updatedUserData } = await api.put('/auth/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            login(updatedUserData.email, profileData.password || updatedUserData.password);
            setProfileData({
                name: updatedUserData.name,
                email: updatedUserData.email,
                profileImage: updatedUserData.profileImage,
                password: '',
                confirmPassword: '',
            });
            setProfileImageFile(null);
            setSuccessMessage('Profile updated successfully!');
            setIsEditingProfile(false);
        } catch (err) {
            setError('Profile update failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                setLoadingListings(true);
                await api.delete(`/listings/${listingId}`);
                setUserListings(userListings.filter((listing) => listing._id !== listingId));
                setSuccessMessage('Listing deleted successfully!');
            } catch (err) {
                setError('Failed to delete listing: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoadingListings(false);
            }
        }
    };

    // Callback when a listing is updated from the UpdateListingForm
    const handleListingUpdated = (updatedListing) => {
        setUserListings(userListings.map(l => (l._id === updatedListing._id ? updatedListing : l)));
        setEditingListingId(null); // Exit edit mode
        setSuccessMessage('Listing updated successfully!');
        setError(null); // Clear any previous errors
    };

    const handleCancelEdit = () => {
        setEditingListingId(null); // Exit edit mode
        setError(null);
        setSuccessMessage(null);
    };

    if (!user || loadingProfile || loadingListings) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 my-8">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">User Profile</h1>

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

            {/* Profile Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">My Info</h2>
                {!isEditingProfile ? (
                    <div className="flex flex-col items-center">
                        <img
                            src={profileData.profileImage}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-blue-400"
                        />
                        <p className="text-xl font-medium text-gray-800 mb-2">{profileData.name}</p>
                        <p className="text-gray-600 mb-4">{profileData.email}</p>
                        <button
                            onClick={() => setIsEditingProfile(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                        >
                            Edit Profile
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="flex flex-col items-center mb-4">
                             <img
                                src={profileData.profileImage}
                                alt="Current Profile"
                                className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-blue-400"
                            />
                            <label htmlFor="profileImageFile" className="block text-blue-600 text-sm cursor-pointer hover:underline">
                                Change Profile Image
                            </label>
                            <input
                                type="file"
                                name="profileImageFile"
                                id="profileImageFile"
                                onChange={handleProfileImageChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                            <input type="text" name="name" id="name" value={profileData.name} onChange={handleProfileChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                            <input type="email" name="email" id="email" value={profileData.email} onChange={handleProfileChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">New Password (optional)</label>
                            <input type="password" name="password" id="password" value={profileData.password} onChange={handleProfileChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password</label>
                            <input type="password" name="confirmPassword" id="confirmPassword" value={profileData.confirmPassword} onChange={handleProfileChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditingProfile(false);
                                    setError(null);
                                    setSuccessMessage(null);
                                    setProfileData({ ...profileData, password: '', confirmPassword: '' });
                                }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                                disabled={loadingProfile}
                            >
                                {loadingProfile ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* My Listings Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">My Listings</h2>
                {loadingListings && <p className="text-center text-gray-600">Loading your listings...</p>}
                {!loadingListings && userListings.length === 0 && (
                    <p className="text-center text-gray-600">You haven't posted any listings yet. <Link to="/listings" className="text-blue-600 hover:underline">Create one!</Link></p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userListings.map((listing) => (
                        <div key={listing._id} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            {/* <--- Conditional rendering for UpdateListingForm --> */}
                            {editingListingId === listing._id ? (
                                <UpdateListingForm
                                    listingId={listing._id}
                                    onListingUpdated={handleListingUpdated}
                                    onCancel={handleCancelEdit}
                                />
                            ) : (
                                <>
                                    {listing.images && listing.images.length > 0 && (
                                        <img
                                            src={listing.images[0].url}
                                            alt={listing.title}
                                            className="w-full h-32 object-cover"
                                        />
                                    )}
                                    <div className="p-3">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{listing.title}</h3>
                                        <p className="text-gray-700 text-sm mb-2">₹{listing.price.toLocaleString()}</p>
                                        <div className="flex space-x-2 mt-2">
                                            {/* Link to view single listing */}
                                            <Link
                                                to={`/listings/${listing._id}`}
                                                className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded flex-1 text-center"
                                            >
                                                View
                                            </Link>
                                            {/* Button to activate edit mode */}
                                            <button
                                                onClick={() => setEditingListingId(listing._id)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 px-3 rounded flex-1 text-center"
                                            >
                                                Edit
                                            </button>
                                            {/* Delete button */}
                                            <button
                                                onClick={() => handleDeleteListing(listing._id)}
                                                className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded flex-1 text-center"
                                                disabled={loadingListings}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;