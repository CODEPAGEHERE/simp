// app/src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Import the Navbar component
import '../App.css'; // Main app styles
import './Home.css'; // Specific styles for LandingPage

const LandingPage = () => {
  return (
    <div className="landing-page-wrapper">
      <Navbar /> {/* Render the Navbar */}

      <div className="landing-main-content">
        {/* Placeholder for your main logo if separate from navbar */}
        {/* <img src="/main-logo-icon.svg" alt="Simp Main Logo" className="main-logo-centered" /> */}
        <div className="main-logo-icon-container">
          <img src="/logo-icon.svg" alt="Simp Logo" className="main-logo-icon" />
        </div>

        <h1 className="landing-title">Simp</h1>
        <p className="landing-subtitle">Your Personal Time Schedule</p>
        <p className="landing-subtitle-small">Any Where, Any Time</p>

        <div className="landing-actions">
          <Link to="/login" className="btn simp-btn-start">Start</Link>
          <span className="or-separator">OR</span>
          <Link to="/register" className="btn simp-btn-signup-mobile">Signup</Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;