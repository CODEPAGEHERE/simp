import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const Navigate = useNavigate();
    const Location = useLocation();

    const [IsAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('jwtToken');
    });

    const [UserData, setUserData] = useState(null);

    const PublicAccessiblePaths = ['/login', '/register', '/forgot-password', '/'];

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
                console.log("DEBUG: AuthContext: User data fetched from /auth/me:", Data);
                setUserData({
                    UserId: Data.Id,
                    Username: Data.Username,
                    Name: Data.Name,
                    PhoneNo: Data.PhoneNo,
                    CreatedAt: Data.CreatedAt,
                });
            } else {
                const errorBody = await Response.json();
                console.error('ERROR: AuthContext: Failed to fetch user data from /auth/me. Status:', Response.status, 'Body:', errorBody);
                localStorage.removeItem('jwtToken');
                setIsAuthenticated(false);
                setUserData(null);
                if (!PublicAccessiblePaths.includes(Location.pathname)) {
                    Navigate('/login');
                }
            }
        } catch (Error) {
            console.error('ERROR: AuthContext: Network error while fetching user data from /auth/me:', Error);
            setUserData(null);
        }
    };

    const Login = (Token, Person = null) => {
        console.log("DEBUG: AuthContext.Login: Function called.");
        try {
            localStorage.setItem('jwtToken', Token);
            console.log("DEBUG: AuthContext.Login: jwtToken saved to localStorage.");
        } catch (e) {
            console.error("ERROR: AuthContext.Login: Error setting token in localStorage:", e);
        }

        setIsAuthenticated(true);
        console.log("DEBUG: AuthContext.Login: IsAuthenticated state set to true (will reflect on next render).");

        if (Person) {
            setUserData({
                UserId: Person.Id,
                Username: Person.Username,
                Name: Person.Name,
                PhoneNo: Person.PhoneNo,
                CreatedAt: Person.CreatedAt,
            });
            console.log("DEBUG: AuthContext.Login: UserData set directly from login response (mapped to UserId).");
        } else {
            FetchUserData(Token);
            console.log("DEBUG: AuthContext.Login: Calling FetchUserData as Person was null.");
        }
    };

    const Logout = () => {
        console.log("DEBUG: AuthContext.Logout: Function called. Attempting to log out.");
        localStorage.removeItem('jwtToken');
        console.log("DEBUG: AuthContext.Logout: jwtToken removed from localStorage.");
        setIsAuthenticated(false);
        setUserData(null);
        Navigate('/');
        console.log("DEBUG: AuthContext.Logout: Navigation to '/' attempted.");
    };

    useEffect(() => {
        const Token = localStorage.getItem('jwtToken');
        console.log("DEBUG: AuthContext useEffect: Initial check. Token:", Token ? "Present" : "Missing", "IsAuthenticated:", IsAuthenticated, "Path:", Location.pathname);

        if (Token) {
            if (!IsAuthenticated) {
                setIsAuthenticated(true);
            }
            if (!UserData) {
                FetchUserData(Token);
            }

            if (IsAuthenticated && Location.pathname === '/login') {
                console.log("DEBUG: AuthContext useEffect: Authenticated, on /login, redirecting to /dashboard.");
                Navigate('/dashboard');
            }
        } else {
            setIsAuthenticated(false);
            setUserData(null);
            console.log("DEBUG: AuthContext useEffect: No token found. IsAuthenticated set to false.");
        }

        const HandleStorageChange = (Event) => {
            if (Event.key === 'jwtToken') {
                const NewToken = Event.newValue;
                setIsAuthenticated(!!NewToken);
                if (NewToken) {
                    FetchUserData(NewToken);
                } else {
                    setUserData(null);
                    if (!PublicAccessiblePaths.includes(Location.pathname)) {
                        Navigate('/login');
                    }
                }
            }
        };

        window.addEventListener('storage', HandleStorageChange);

        return () => {
            window.removeEventListener('storage', HandleStorageChange);
        };
    }, [IsAuthenticated, UserData, Location.pathname, Navigate]);

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