// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; // Our Axios instance
import { useNavigate } from 'react-router-dom';

// Create the Auth Context
const AuthContext = createContext();

// Create a custom hook to use the Auth Context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores user info if logged in
    const [loading, setLoading] = useState(true); // To manage loading state during initial check
    const navigate = useNavigate(); // For navigation after login/logout

    useEffect(() => {
        // Check localStorage for user info on initial load
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                setUser(JSON.parse(userInfo));
            } catch (e) {
                console.error("Failed to parse userInfo from localStorage", e);
                localStorage.removeItem('userInfo'); // Clear invalid data
            }
        }
        setLoading(false); // Finished initial loading check
    }, []);

    // Function to handle user login
    const login = async (email, password) => {
        try {
            setLoading(true);
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setLoading(false);
            navigate('/'); // Navigate to home page after successful login
            return data;
        } catch (error) {
            setLoading(false);
            // Error handling: Get message from backend or default
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            throw new Error(errorMessage); // Re-throw to be caught by component
        }
    };

    // Function to handle user registration
    const register = async (name, email, password) => {
        try {
            setLoading(true);
            const { data } = await api.post('/auth/register', { name, email, password });
            setUser(data); // Log in user immediately after registration
            localStorage.setItem('userInfo', JSON.stringify(data));
            setLoading(false);
            navigate('/'); // Navigate to home page
            return data;
        } catch (error) {
            setLoading(false);
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            throw new Error(errorMessage);
        }
    };

    // Function to handle user logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        navigate('/auth'); // Navigate to login page after logout
    };

    // Value provided by the context to its consumers
    const authContextValue = {
        user,
        loading,
        login,
        register,
        logout,
    };

    if (loading) {
        // You could render a loading spinner here
        return <div>Loading authentication...</div>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};