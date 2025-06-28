import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// If you're decoding JWTs on the frontend for initial user data, uncomment this.
// import jwt_decode from 'jwt-decode'; // Remember to `npm install jwt-decode` or `yarn add jwt-decode`

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Initialize isAuthenticated based on token presence in localStorage
        return !!localStorage.getItem('jwtToken');
    });

    const [userData, setUserData] = useState(null); // userData will store the fetched user details

    // Helper function to fetch user data from the backend
    const fetchUserData = async (token) => {
        if (!token) {
            setUserData(null);
            return;
        }
        try {
            const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT;
            // This endpoint should return the current user's profile based on the JWT
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Send the token for authentication
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("DEBUG: User data fetched from /auth/me:", data);
                setUserData(data); // Set the user data from the backend response
            } else {
                console.error('Failed to fetch user data:', response.status, await response.json());
                // If fetching user data fails (e.g., token expired), invalidate authentication
                localStorage.removeItem('jwtToken');
                setIsAuthenticated(false);
                setUserData(null);
                navigate('/login'); // Redirect to login
            }
        } catch (error) {
            console.error('Network error while fetching user data:', error);
            // This could be a temporary network issue, don't necessarily log out immediately
            setUserData(null); // Clear user data
        }
    };

    // The login function now ensures userData is populated
    const login = (token, user = null) => {
        localStorage.setItem('jwtToken', token);
        setIsAuthenticated(true);
        if (user) {
            // If the login response directly provides user data (like your 'person' object)
            setUserData(user);
        } else {
            // Otherwise, fetch user data after setting the token
            fetchUserData(token);
        }
    };

    // The logout function
    const logout = () => {
        localStorage.removeItem('jwtToken');
        setIsAuthenticated(false);
        setUserData(null);
        navigate('/login');
    };

    // useEffect to re-hydrate authentication state and user data on component mount/refresh
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            // If a token exists, consider user authenticated
            setIsAuthenticated(true);
            // And if userData isn't already set, fetch it (e.g., on hard refresh)
            if (!userData) { // Prevents re-fetching if userData is already populated
                fetchUserData(token);
            }
        } else {
            // If no token, ensure authentication state is false
            setIsAuthenticated(false);
            setUserData(null);
        }

        // Listener for storage events (e.g., logout from another tab)
        const handleStorageChange = (event) => {
            if (event.key === 'jwtToken') {
                const newToken = event.newValue;
                setIsAuthenticated(!!newToken);
                if (newToken) {
                    fetchUserData(newToken); // Fetch user data if token reappears
                } else {
                    setUserData(null);
                    navigate('/login'); // Redirect if token is cleared elsewhere
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [navigate, userData]); // Depend on navigate and userData to ensure effects run correctly

    // The value provided to any component that consumes this context
    const contextValue = {
        isAuthenticated,
        userData, // This is what Dashboard and Nav will consume
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easier consumption in components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};