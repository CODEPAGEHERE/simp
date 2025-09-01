import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const publicAccessiblePaths = ['/login', '/register', '/forgot-password', '/'];

  const verifyAuth = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_SIMP_API_POINT;
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('ERROR: AuthContext: Network error while verifying auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
  try {
    const apiBaseUrl = import.meta.env.VITE_SIMP_API_POINT;
    const response = await fetch(`${apiBaseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setIsAuthenticated(false);
      console.log('Logged out successfully');
    } else {
      console.error('ERROR: AuthContext: Logout failed');
    }
  } catch (error) {
    console.error('ERROR: AuthContext: Network error while logging out:', error);
  }
};

  useEffect(() => {
    verifyAuth();
  }, [location.pathname]);

  useEffect(() => {
  if (!isLoading && !isAuthenticated && !publicAccessiblePaths.includes(location.pathname)) {
    navigate('/login');
  }
}, [isAuthenticated, isLoading, location.pathname, navigate]);

  const contextValue = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
