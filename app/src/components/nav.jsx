// File: frontend/src/components/Nav.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';
import { useAuth } from '../context/AuthContext';

const Nav = () => {
    const { IsAuthenticated, Logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogoutClick = () => {
        Logout();
        setIsMenuOpen(false);
    };

    useEffect(() => {
        if (!IsAuthenticated && isMenuOpen) {
            setIsMenuOpen(false);
        }
    }, [IsAuthenticated, isMenuOpen]);

    return (
        <nav className="simp-navbar">
            <div className="simp-navbar-inner">
                <div className="simp-navbar-brand">
                    <Link to={IsAuthenticated ? "/dashboard" : "/"}>
                        <img src="/logoh.png" alt="Simp Logo" className="logo-icon" />
                        <span className="logo-text">Simp</span>
                    </Link>
                </div>

                <button
                    className={`hamburger-menu-button ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                <ul className={`simp-navbar-nav ${isMenuOpen ? 'open' : ''}`}>
                    {/* These links are always available */}
                    <li><Link to="/make-schedule" onClick={() => setIsMenuOpen(false)}>Make Schedule</Link></li>
                    <li><Link to="/ongoing-schedule" onClick={() => setIsMenuOpen(false)}>Ongoing Schedule</Link></li>
                    <li><Link to="/saved-schedule" onClick={() => setIsMenuOpen(false)}>Saved Schedule</Link></li>
                    <li><Link to="/settings" onClick={() => setIsMenuOpen(false)}>Setting</Link></li>
                    <li><Link to="/help" onClick={() => setIsMenuOpen(false)}>Help</Link></li>

                    {/* Conditional rendering for Auth buttons in mobile menu */}
                    {IsAuthenticated ? (
                        <li className="mobile-auth-item">
                            <button className="btn simp-btn-logout-mobile" onClick={handleLogoutClick}>Logout</button>
                        </li>
                    ) : (
                        <>
                            <li className="mobile-auth-item">
                                <Link to="/login" className="btn simp-btn-login-mobile" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            </li>
                            <li className="mobile-auth-item">
                                <Link to="/register" className="btn simp-btn-signup-mobile" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                            </li>
                        </>
                    )}
                </ul>

                {/* Desktop-only Auth buttons */}
                <div className="simp-navbar-auth">
                    {IsAuthenticated ? (
                        <button className="btn btn-outline-dark simp-btn-logout" onClick={handleLogoutClick}>Logout</button>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline-dark simp-btn-login">Login</Link>
                            <Link to="/register" className="btn btn-outline-dark simp-btn-signup">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Nav;