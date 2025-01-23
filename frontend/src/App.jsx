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
import Interview from './components/Interview';
import Job from './components/Job';
import Courses from './components/Courses';
import AdminDashboard from './components/admin/AdminDashboard';
import Profile from './components/Profile';
import Leaderboard from './components/LeaderBoard';
import MyCourses from './components/MyCourses';
import Solve from './components/Solve';

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

        {/*User Routes*/}
        <Route path="/profile" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/solve/:problemId" element={<Solve />}/>
        
        {/*Nav  page to list  and handle Solve button */}
        <Route path="/problems" element={<Problems />} />
        <Route path="/job" element={<Job />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/courses" element={<Courses />} />
        
        {/* Problem-solving IDE Layout (for solving the problem) */}
        <Route path="/solve/:problemId" element={<Solve />}/>
        
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
