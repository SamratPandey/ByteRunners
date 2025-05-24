import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.admin);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

export default AdminProtectedRoute;
