// React import removed - not used
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { checkAuthStatus } from '../redux/actions/authActions';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // Handle initial auth check and OAuth redirects
  useEffect(() => {
    const checkAuth = async () => {
      const params = new URLSearchParams(location.search);
      const isOAuthSuccess = params.get('oauth') === 'success';
      
      // If user is already authenticated and this isn't an OAuth callback, skip additional check
      if (isAuthenticated && isInitialized && !isOAuthSuccess) {
        setAuthCheckComplete(true);
        return;
      }
      
      if (isOAuthSuccess || !isInitialized) {
        // Force auth check for OAuth redirects or when not initialized
        console.log('Checking auth status for OAuth redirect or uninitialized state');
        await dispatch(checkAuthStatus());
      }
      setAuthCheckComplete(true);
    };
    
    checkAuth();
  }, [location.search, dispatch, isInitialized, isAuthenticated]);

  // Show loading while checking authentication status
  if (!isInitialized || !authCheckComplete) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login and pass current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
