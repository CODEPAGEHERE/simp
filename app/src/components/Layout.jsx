import React from 'react';
import Nav from './Nav';
import './Layout.css';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { IsAuthenticated, Logout } = useAuth();

    return (
        <div className="app-container">
            <Nav IsAuthenticated={IsAuthenticated} OnLogout={Logout} />

            <main className="main-content">
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default Layout;