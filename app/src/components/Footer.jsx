import React from 'react';
import './Footer.css'; 

const Footer = () => {
    return (
        <footer className="simp-footer">
            <div className="simp-footer-content">
                <p>Copyright  &copy; {new Date().getFullYear()} Simp. All rights reserved | Graphitie Originals</p>
            </div>
        </footer>
    );
};

export default Footer;