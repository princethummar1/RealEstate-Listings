// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Default to localhost:5000/api
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('userInfo')); // Get user info from localStorage
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`; // Attach token to Authorization header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;