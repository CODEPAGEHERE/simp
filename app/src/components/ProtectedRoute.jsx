import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import your useAuth hook

const ProtectedRoute = () => {
  // Use the useAuth hook to get the isAuthenticated state from your context
  const { isAuthenticated } = useAuth();

  // If not authenticated (based on the reactive context state), redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the nested route components
  return <Outlet />;
};

export default ProtectedRoute;