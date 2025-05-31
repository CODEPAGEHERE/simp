import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Import the Navbar component
import '../App.css'; // Main app styles
import './Home.css'; // Specific styles for LandingPage

// Assuming logoh.png is in src/assets/
// If you're keeping it in public/, keep src="/logoh.png" and remove this import.
// import logoh from '../assets/logoh.png';

const Home = () => {
  return (
    <div className="landing-page-wrapper">
      <Navbar /> {/* Render the Navbar */}

      <div className="landing-main-content">
        {/* Placeholder for your main logo if separate from navbar */}
        {/* <img src="/main-logo-icon.svg" alt="Simp Main Logo" className="main-logo-centered" /> */}
        <div className="main-logo-icon-container">
          <img src="/logoh.png" alt="Simp Logo" className="main-logo-icon" />
          {/* If using import, change src="/logoh.png" to src={logoh} */}
        </div>

        <h1 className="landing-title">Simp</h1>
        <p className="landing-subtitle">Your Personal Time Schedule</p>
        <p className="landing-subtitle-small">Any Where, Any Time</p>

        {/* This is the section that needs to be conditionally displayed/hidden */}
        <div className="landing-actions">
          <Link to="/login" className="btn simp-btn-start lnk">Start</Link>
          <span className="or-separator">OR</span>
          <Link to="/register" className="btn simp-btn-signup-mobile lnkk">Signup</Link>
        </div>
      </div> {/* Correct closing div for landing-main-content */}
    </div>
  );
};

export default Home;