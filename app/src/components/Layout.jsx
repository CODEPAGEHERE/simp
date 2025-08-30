import React from 'react';
import Nav from './Nav';
import './Layout.css';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Nav />

      <main className="main-content">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
