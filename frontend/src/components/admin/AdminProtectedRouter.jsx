import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminProtectedRoute = ({ children }) => {
  // Change from state.auth.token to state.admin.token
  const token = useSelector((state) => state.admin.token);

  if (!token) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

export default AdminProtectedRoute;
