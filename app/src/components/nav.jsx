import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Custom CSS for Navbar

// Accept onLogout prop
const Nav = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage mobile menu visibility

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout(); // Call the passed-in logout function
    }
    setIsMenuOpen(false); // Close the menu after logout
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
          {/* Removed: <li><Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link></li> */}

          {/* Mobile-only Logout Button - this will be part of the vertical dropdown */}
          <li className="mobile-auth-item">
            <button className="btn simp-btn-logout-mobile" onClick={handleLogoutClick}>Logout</button>
          </li>
        </ul>
        {/* Desktop-only Logout Button */}
        <div className="simp-navbar-auth">
          <button className="btn btn-outline-dark simp-btn-logout" onClick={handleLogoutClick}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Nav;