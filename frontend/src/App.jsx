import React from 'react';
import { Navigate, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';  
import Login from './components/Login';  
import ForgotPassword from './components/ForgotPassword'; 
import ResetPassword from './components/ResetPassword';
import Signup from './components/Signup';  
import Dashboard from './components/Dashboard';  
import ProtectedRoute from './components/ProtectedRoute'; 
import PublicRoute from './components/PublicRoute';

import AdminProtectedRouter from './components/admin/AdminProtectedRouter';
import AdminPublicRoute from './components/admin/AdminPublicRoute';

import AdminLogin from './components/admin/AdminLogin';
import IDELayout from './components/IDELayout';
import Problems from './components/Problems';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } /> 
        <Route path="/signup" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } /> 
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} /> 
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard /> 
            </ProtectedRoute>
          } 
        />
        
        {/* Problem page to list problems and handle Solve button */}
        <Route path="/problems" element={<Problems />} />
        
        {/* Problem-solving IDE Layout (for solving the problem) */}
        <Route path="/solve/:id" element={<IDELayout />} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
        

        {/* Admin routes */}
        <Route path="/admin/login" 
          element={
          <AdminPublicRoute>
            <AdminLogin />
          </AdminPublicRoute>
          
          } />
        <Route path='/admin-dashboard' element={<AdminProtectedRouter><AdminDashboard /></AdminProtectedRouter>}/>
      </Routes>
    </Router>
  );
}

export default App;
