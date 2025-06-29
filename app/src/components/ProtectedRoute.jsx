// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// Import your useAuth hook - assuming the file is context/AuthContext.jsx
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  // Use the useAuth hook to get the IsAuthenticated state from your context
  // IMPORTANT: Use IsAuthenticated (PascalCase) as defined in AuthContext.jsx
  const { IsAuthenticated } = useAuth();

  // If not authenticated (based on the reactive context state), redirect
  if (!IsAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the nested route components
  return <Outlet />;
};

export default ProtectedRoute;