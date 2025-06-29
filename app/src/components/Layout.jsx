// src/components/Layout.jsx

import React from 'react';
// Assuming the file is components/Nav.jsx and exports a component named Nav
import Nav from './Nav';
import './Layout.css';
// Assuming the file is components/Footer.jsx and exports a component named Footer
import Footer from './Footer';
// Import your useAuth hook - assuming the file is context/AuthContext.jsx
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    // Get IsAuthenticated state and the Logout function directly from AuthContext
    // IMPORTANT: Use IsAuthenticated (PascalCase) and Logout (PascalCase) as defined in AuthContext.jsx
    const { IsAuthenticated, Logout } = useAuth();

    return (
        <div className="app-container">
            {/* Pass IsAuthenticated and the Logout function (from context) to the Nav component */}
            <Nav IsAuthenticated={IsAuthenticated} OnLogout={Logout} />

            <main className="main-content">
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default Layout;