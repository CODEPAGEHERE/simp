import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const Navigate = useNavigate();

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
                Navigate('/login');
            }
        } catch (Error) {
            console.error('Network error while fetching user data:', Error);
            setUserData(null);
        }
    };

    const Login = (Token, Person = null) => {
        localStorage.setItem('jwtToken', Token);
        setIsAuthenticated(true);
        if (Person) {
            setUserData(Person);
        } else {
            FetchUserData(Token);
        }
    };

    const Logout = () => {
        localStorage.removeItem('jwtToken');
        setIsAuthenticated(false);
        setUserData(null);
        Navigate('/login');
    };

    useEffect(() => {
        const Token = localStorage.getItem('jwtToken');
        if (Token) {
            if (!IsAuthenticated) {
                setIsAuthenticated(true);
            }
            if (!UserData) {
                FetchUserData(Token);
            }
            if (IsAuthenticated && Navigate.location?.pathname === '/login') {
                 Navigate('/dashboard');
            } else if (IsAuthenticated && Navigate.location?.pathname === '/') {
                 Navigate('/dashboard');
            }
        } else {
            setIsAuthenticated(false);
            setUserData(null);
            if (Navigate.location?.pathname !== '/login' && Navigate.location?.pathname !== '/register') {
                Navigate('/login');
            }
        }

        const HandleStorageChange = (Event) => {
            if (Event.key === 'jwtToken') {
                const NewToken = Event.newValue;
                setIsAuthenticated(!!NewToken);
                if (NewToken) {
                    FetchUserData(NewToken);
                } else {
                    setUserData(null);
                    Navigate('/login');
                }
            }
        };

        window.addEventListener('storage', HandleStorageChange);

        return () => {
            window.removeEventListener('storage', HandleStorageChange);
        };
    }, [IsAuthenticated, UserData, Navigate]);

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