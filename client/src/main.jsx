// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom'; // <--- NEW: Import BrowserRouter
import { AuthProvider } from './context/AuthContext.jsx'; // <--- NEW: Import AuthProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> {/* <--- Wrap App with Router */}
      <AuthProvider> {/* <--- Wrap App with AuthProvider */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);