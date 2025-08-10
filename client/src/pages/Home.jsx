import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react"; // For adding an icon to the button

const Home = () => {
    return (
        // Enhanced background with a subtle gradient and rounded corners for the main card
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-br from-blue-100 to-indigo-200 font-inter dark:from-slate-900 dark:to-slate-950 ">
            
            {/* Main content container with a distinct card-like appearance */}
            <div className="max-w-6l bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-slate-700 transform transition-all duration-500 hover:scale-[1.01] hover:shadow-3xl relative overflow-hidden">
                {/* Optional: Subtle decorative element */}
                <div className="absolute top-0 left-0 w-24 h-24 -translate-x-1/2 -translate-y-1/2 bg-blue-300 rounded-full dark:bg-blue-700 opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 translate-x-1/2 translate-y-1/2 bg-purple-300 rounded-full dark:bg-purple-700 opacity-10 blur-3xl"></div>

                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 text-balance dark:text-gray-50 sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
                    Welcome to Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-800 dark:from-blue-400 dark:to-purple-500">Dream Real Estate</span> Journey
                </h1>
                
                <div className="mt-8 space-y-4">
                    <p className="text-xl leading-relaxed text-gray-800 dark:text-gray-100">
                        Discover your perfect property or effortlessly list your home with our intuitive platform.
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-200">
                        Explore diverse listings, get accurate price predictions, and manage your real estate portfolio with unparalleled ease.
                    </p>
                </div>

                {/* A more prominent and engaging button with an icon and hover effects */}
                <Button 
                    size="lg" 
                    className="px-10 py-4 mt-10 text-lg font-bold text-white transition-all duration-300 ease-in-out transform rounded-full shadow-xl hover:shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:-translate-y-1 focus:ring-4 focus:ring-blue-300 dark:focus:ring-purple-700"
                >
                    Get Started
                    <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
            </div>

        </div>
    );
};

export default Home;
