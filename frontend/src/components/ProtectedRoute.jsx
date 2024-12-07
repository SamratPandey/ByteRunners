import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    // If there's no token, redirect to login page
    return <Navigate to="/login" />;
  }

  return children; // Allow access to the protected route
};

export default ProtectedRoute;
