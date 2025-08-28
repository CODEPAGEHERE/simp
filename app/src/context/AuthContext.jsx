import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const Navigate = useNavigate();
    const Location = useLocation();

    const [IsAuthenticated, setIsAuthenticated] = useState(false);
    const [UserData, setUserData] = useState(null);

    const PublicAccessiblePaths = ['/login', '/register', '/forgot-password', '/'];

    const FetchUserData = async () => {
        try {
            const ApiBaseUrl = import.meta.env.VITE_SIMP_API_POINT;
            const Response = await fetch(`${ApiBaseUrl}/auth/me`, {
                method: 'GET',
                credentials: 'include', // Include cookies in the request
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
                setIsAuthenticated(true);
            } else {
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

    const Login = async () => {
        try {
            const ApiBaseUrl = import.meta.env.VITE_SIMP_API_POINT;
            const Response = await fetch(`${ApiBaseUrl}/auth/login`, {
                method: 'POST',
                credentials: 'include', // Include cookies in the request
            });

            if (Response.ok) {
                await FetchUserData();
                Navigate('/dashboard');
            } else {
                console.error('ERROR: AuthContext: Login failed');
            }
        } catch (Error) {
            console.error('ERROR: AuthContext: Network error while logging in:', Error);
        }
    };

    const Logout = async () => {
        try {
            const ApiBaseUrl = import.meta.env.VITE_SIMP_API_POINT;
            const Response = await fetch(`${ApiBaseUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include', // Include cookies in the request
            });

            if (Response.ok) {
                setIsAuthenticated(false);
                setUserData(null);
                Navigate('/');
            } else {
                console.error('ERROR: AuthContext: Logout failed');
            }
        } catch (Error) {
            console.error('ERROR: AuthContext: Network error while logging out:', Error);
        }
    };

    useEffect(() => {
        FetchUserData();
    }, [Location.pathname]);

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
