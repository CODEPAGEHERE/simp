import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import './Home.css';

const Home = () => {
    return (
        <div className="landing-page-wrapper">
            <div className="landing-main-content">
                <div className="main-logo-icon-container">
                    <img src="/logoh.png" alt="Simp Logo" className="main-logo-icon" />
                </div>

                <h1 className="landing-title">Simp</h1>
                <p className="landing-subtitle">Your Personal Time Schedule</p>
                <p className="landing-subtitle-small">Any Where, Any Time</p>

                <div className="landing-actions">
                    <Link to="/login" className="btn simp-btn-start lnk">Start</Link>
                    <span className="or-separator">OR</span>
                    <Link to="/register" className="btn simp-btn-signup-mobile lnkk">Signup</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;