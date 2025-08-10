// client/src/pages/About.jsx
import React from 'react';

const About = () => {
    return (
        <div className="container mx-auto p-4 md:p-8 my-8 text-center bg-white shadow-md rounded-lg">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">About Real Estate App</h1>
            <p className="text-lg text-gray-700 mb-4">
                This is a full-stack real estate web application built using React, Node.js/Express,
                and MongoDB. It allows users to register, manage their profiles, and list properties
                for sale or rent.
            </p>
            <p className="text-lg text-gray-700 mb-4">
                A key feature is the property price prediction, which leverages a Python/Django
                backend with a Machine Learning model trained on real-world Indian residential
                property data from Kaggle.
            </p>
            <p className="text-md text-gray-600">
                Developed as a comprehensive project to showcase modern web development and
                machine learning integration.
            </p>
        </div>
    );
};

export default About;