// client/src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import your pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Listings from './pages/Listings';
import Profile from './pages/Profile';
import Prediction from './pages/Prediction';
import About from './pages/About';
import SingleListing from './pages/SingleListing'; // <--- NEW: Import SingleListing

// Import components
import Navbar from './components/Navbar';

//shadcn
import { Button } from "@/components/ui/button"

const App = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading) {
            if (user) {
                if (location.pathname === '/auth') {
                    navigate('/');
                }
            } else {
                const protectedPaths = ['/profile'];
                if (protectedPaths.includes(location.pathname)) {
                    navigate('/auth');
                }
            }
        }
    }, [user, loading, navigate, location.pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
                Loading Application...
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/listings" element={<Listings />} />
                    <Route path="/listings/:id" element={<SingleListing />} /> {/* <--- NEW: Add SingleListing Route */}
                    <Route path="/prediction" element={<Prediction />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/about" element={<About />} />

                    <Route path="*" element={<h1 className="text-center text-4xl mt-20">404 - Page Not Found</h1>} />
                </Routes>
            </main>
        </div>
    );
};

export default App;