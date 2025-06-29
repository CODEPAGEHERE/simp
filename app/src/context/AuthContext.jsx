// File: frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const Navigate = useNavigate();
    const Location = useLocation(); // To get current path correctly

    const [IsAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('jwtToken');
    });

    const [UserData, setUserData] = useState(null);

    const FetchUserData = async (Token) => {
        if (!Token) {
            setUserData(null);
            return;
        }
        try {
            const ApiBaseUrl = import.meta.env.VITE_SIMP_API_POINT;
            const Response = await fetch(`${ApiBaseUrl}/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Token}`,
                },
            });

            if (Response.ok) {
                const Data = await Response.json();
                console.log("DEBUG: User data fetched from /auth/me:", Data);
                setUserData(Data);
            } else {
                console.error('Failed to fetch user data:', Response.status, await Response.json());
                localStorage.removeItem('jwtToken');
                setIsAuthenticated(false);
                setUserData(null);
                // When token is invalid, and API call fails, explicitly redirect to login
                // if not already on a public route.
                const PublicRoutesAfterLogout = ['/login', '/register', '/forgot-password', '/'];
                if (!PublicRoutesAfterLogout.includes(Location.pathname)) {
                    Navigate('/login');
                }
            }
        } catch (Error) {
            console.error('Network error while fetching user data:', Error);
            setUserData(null); // Clear user data on network error
        }
    };

    const Login = (Token, Person = null) => {
        console.log("AuthContext.Login: Function called.");
        console.log("AuthContext.Login: Token received =", Token);

        try {
            localStorage.setItem('jwtToken', Token);
            console.log("AuthContext.Login: localStorage.setItem executed.");
            console.log("AuthContext.Login: Token in localStorage AFTER setItem =", localStorage.getItem('jwtToken'));
        } catch (e) {
            console.error("AuthContext.Login: Error setting token in localStorage:", e);
        }

        setIsAuthenticated(true);
        console.log("AuthContext.Login: IsAuthenticated state set to true (will reflect on next render).");

        if (Person) {
            setUserData(Person);
            console.log("AuthContext.Login: UserData set from Person object.");
        } else {
            FetchUserData(Token); // Fetch full user data if not provided
            console.log("AuthContext.Login: FetchUserData called as Person was null.");
        }
        console.log("AuthContext.Login: Login process concluded.");
    };

    const Logout = () => {
        console.log("AuthContext.Logout: Function called. Attempting to log out.");
        localStorage.removeItem('jwtToken');
        console.log("AuthContext.Logout: jwtToken removed from localStorage.");
        setIsAuthenticated(false);
        setUserData(null);
        Navigate('/'); // Redirect to Home page on explicit logout
        console.log("AuthContext.Logout: Navigation to '/' attempted.");
    };

    // Main authentication effect handler
    useEffect(() => {
        const Token = localStorage.getItem('jwtToken');
        console.log("AuthContext useEffect - Token in localStorage (at useEffect start):", Token ? "Present" : "Missing");
        console.log("AuthContext useEffect - IsAuthenticated state (at useEffect start):", IsAuthenticated);
        console.log("AuthContext useEffect - Current Path (at useEffect start):", Location.pathname);

        if (Token) {
            if (!IsAuthenticated) {
                setIsAuthenticated(true);
            }
            if (!UserData) {
                FetchUserData(Token); // Fetch user data if token exists but UserData is null
            }

            // If authenticated and on the login page, redirect to dashboard
            if (IsAuthenticated && Location.pathname === '/login') {
                Navigate('/dashboard');
            }
        } else {
            // If no token exists, ensure authenticated state is false and user data is null
            setIsAuthenticated(false);
            setUserData(null);
            // Crucial: Removed the conditional redirect here.
            // React Router and ProtectedRoute will handle access control based on isAuthenticated state.
            // This allows unauthenticated users to access '/', '/register', '/forgot-password', and '*' (404)
            // without being redirected to '/login' by the AuthContext itself.
        }

        const HandleStorageChange = (Event) => {
            if (Event.key === 'jwtToken') {
                const NewToken = Event.newValue;
                setIsAuthenticated(!!NewToken);
                if (NewToken) {
                    FetchUserData(NewToken);
                } else {
                    setUserData(null);
                    // On storage change (e.g., token removed from other tab),
                    // explicitly redirect to login if not on a public route.
                    const PublicRoutesAfterLogout = ['/login', '/register', '/forgot-password', '/'];
                    if (!PublicRoutesAfterLogout.includes(Location.pathname)) {
                        Navigate('/login');
                    }
                }
            }
        };

        window.addEventListener('storage', HandleStorageChange);

        return () => {
            window.removeEventListener('storage', HandleStorageChange);
        };
    }, [IsAuthenticated, UserData, Location.pathname, Navigate]); // Dependencies

    const ContextValue = {
        IsAuthenticated,
        UserData,
        Login,
        Logout,
    };

    return (
        <AuthContext.Provider value={ContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const Context = useContext(AuthContext);
    if (!Context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return Context;
};