import React from 'react';
import Nav from './Nav';
import './Layout.css';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext'; // Import your useAuth hook

const Layout = ({ children }) => { // Removed isAuthenticated, onLogout from props
    // Get isAuthenticated state and the logout function directly from AuthContext
    const { isAuthenticated, logout } = useAuth();

    return (
        <div className="app-container">
            {/* Pass isAuthenticated and the logout function (from context) to the Nav component */}
            <Nav isAuthenticated={isAuthenticated} onLogout={logout} />

            <main className="main-content">
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default Layout;