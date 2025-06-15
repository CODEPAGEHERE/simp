import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="simp-navbar">
      <div className="simp-navbar-inner"> {/* This container is key for desktop margins */}
        <div className="simp-navbar-brand">
          <Link to="/">
            <img src="/logoh.png" alt="Simp Logo" className="logo-icon" />
            <span className="logo-text">Simp</span>
          </Link>
        </div>

        {/* Hamburger Icon - Visible only on mobile, hides on desktop */}
			<button
			  className={`hamburger-menu-button ${isMenuOpen ? 'active' : ''}`}
			  onClick={toggleMenu}
			  aria-label="Toggle navigation menu"
			>
			  <span className="hamburger-line"></span>
			  <span className="hamburger-line"></span>
			  <span className="hamburger-line"></span>
			</button>

        {/* Navigation and Auth sections */}
        {/* simp-navbar-nav will be the vertical dropdown on mobile, horizontal on desktop */}
        <ul className={`simp-navbar-nav ${isMenuOpen ? 'open' : ''}`}>
          <li><Link to="/make-schedule" onClick={() => setIsMenuOpen(false)}>Make Schedule</Link></li>
          <li><Link to="/ongoing-schedule" onClick={() => setIsMenuOpen(false)}>Ongoing Schedule</Link></li>
          <li><Link to="/saved-schedule" onClick={() => setIsMenuOpen(false)}>Saved Schedule</Link></li>
          <li><Link to="/settings" onClick={() => setIsMenuOpen(false)}>Setting</Link></li>
          <li><Link to="/help" onClick={() => setIsMenuOpen(false)}>Help</Link></li>
		  <li><Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link></li>
          {/* Mobile-only Signup Button - this will be part of the vertical dropdown */}
          <li className="mobile-auth-item">
            <Link to="/register" className="btn simp-btn-signup-mobile" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
          </li>
        </ul>
        {/* Desktop-only Signup Button */}
        <div className="simp-navbar-auth">
          <Link to="/register" className="btn btn-outline-dark simp-btn-signup">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;