import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';  
import Login from './components/Login';  
import ForgotPassword from './components/ForgotPassword'; 
import ResetPassword from './components/ResetPassword';
import Signup from './components/Signup';  
import Dashboard from './components/Dashboard';  
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/signup" element={<Signup />} /> 
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
      </Routes>
    </Router>
  );
}

export default App;
