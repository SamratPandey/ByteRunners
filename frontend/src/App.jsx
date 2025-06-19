import { useEffect } from 'react';
import { Navigate, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from './redux/actions/authActions';
import { checkAdminAuthStatus } from './redux/actions/adminActions';
import { Toaster } from 'react-hot-toast';
import { NotificationProvider } from './contexts/NotificationContext';
import AppLoader from './components/AppLoader';
import Home from './components/Home';
import Login from './components/Login';  
import ForgotPassword from './components/ForgotPassword'; 
import ResetPassword from './components/ResetPassword';
import Signup from './components/Signup';  
import EmailVerification from './components/EmailVerification';
import Onboarding from './components/Onboarding';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
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
import JobDetails from './components/JobDetails';
import MyApplications from './components/MyApplications';
import AITestInterface from './components/AITestInterface';
import TestAnalytics from './components/TestAnalytics';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);  // Check user authentication status when the app loads
  // Admin auth will be checked separately in admin routes
  useEffect(() => {
    // Check if this is an OAuth redirect to avoid double auth check
    const params = new URLSearchParams(window.location.search);
    const isOAuthCallback = params.get('oauth') === 'success';
    
    if (!isOAuthCallback) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch]);

  // Show loading screen while auth is being checked
  if (!isInitialized) {
    return <AppLoader />;
  }

  return (
    <NotificationProvider>
      <Router>        {/* Global toast container for notifications */}
        <Toaster position="bottom-right" /><Routes>
          {/* Public routes - accessible by anyone */}
          <Route path="/" element={<Home />} />
        <Route path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />        <Route path="/signup" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route path="/verify-email" 
        element={
          <PublicRoute>
            <EmailVerification />
          </PublicRoute>
        } /><Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} /> 
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          {/* Feature listing pages - accessible by anyone */}
        <Route path="/problems" element={<Problems />} />
        <Route path="/job" element={<Job />} />
        <Route path="/job/:jobId" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/courses" element={<Courses />} />
          {/* Protected routes - require authentication */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} /><Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
        <Route path="/solve/:problemId" element={<ProtectedRoute><Solve /></ProtectedRoute>} />
        <Route path="/course-details/:courseId" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
        <Route path="/ai-test" element={<ProtectedRoute><ErrorBoundary><AITestInterface /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/test-analytics" element={<ProtectedRoute><TestAnalytics /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
        <Route path='/admin-dashboard' element={<AdminProtectedRouter><AdminDashboard /></AdminProtectedRouter>}/>
          {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </NotificationProvider>
  );
}

export default App;
