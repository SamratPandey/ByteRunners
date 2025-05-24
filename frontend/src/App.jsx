import React, { useEffect } from 'react';
import { Navigate, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuthStatus } from './redux/actions/authActions';
import { checkAdminAuthStatus } from './redux/actions/adminActions';
import { Toaster } from 'react-hot-toast';
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
import Problems from './components/Problems';
import Interview from './components/Interview';
import Job from './components/Job';
import Courses from './components/Courses';
import AdminDashboard from './components/admin/AdminDashboard';
import Profile from './components/Profile';
import Leaderboard from './components/LeaderBoard';
import MyCourses from './components/MyCourses';
import Solve from './components/Solve';
import CourseDetails from './components/CourseDetails';

function App() {
  const dispatch = useDispatch();

  // Check authentication status when the app loads
  useEffect(() => {
    dispatch(checkAuthStatus());
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);
  return (
    <Router>
      {/* Global toast container for notifications */}
      <Toaster position="top-right" />
      
      <Routes>
        {/* Public routes - accessible by anyone */}
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
        
        {/* Feature listing pages - accessible by anyone */}
        <Route path="/problems" element={<Problems />} />
        <Route path="/job" element={<Job />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/courses" element={<Courses />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
        <Route path="/solve/:problemId" element={<ProtectedRoute><Solve /></ProtectedRoute>} />
        <Route path="/course-details/:courseId" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
        <Route path='/admin-dashboard' element={<AdminProtectedRouter><AdminDashboard /></AdminProtectedRouter>}/>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
