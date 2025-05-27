import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Custom CSS for Navbar

const Navbar = () => {
  return (
    <nav className="simp-navbar">
      <div className="simp-navbar-brand">
        <Link to="/">
          {/* Replace with your actual logo image */}
          <img src="/logo-icon.svg" alt="Simp Logo" className="logo-icon" />
          <span className="logo-text">Simp</span>
        </Link>
      </div>
      <ul className="simp-navbar-nav">
        <li><Link to="/make-schedule">Make Schedule</Link></li>
        <li><Link to="/ongoing-schedule">Ongoing Schedule</Link></li>
        <li><Link to="/saved-schedule">Saved Schedule</Link></li>
        <li><Link to="/settings">Setting</Link></li>
        <li><Link to="/help">Help</Link></li>
      </ul>
      <div className="simp-navbar-auth">
        <Link to="/register" className="btn btn-outline-dark simp-btn-signup">Sign Up</Link>
      </div>
    </nav>
  );
};

export default Navbar;