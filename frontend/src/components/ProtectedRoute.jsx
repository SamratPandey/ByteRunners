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
      if (params.get('oauth') === 'success' || !isInitialized) {
        // Force auth check for OAuth redirects or when not initialized
        await dispatch(checkAuthStatus());
      }
      setAuthCheckComplete(true);
    };
    
    checkAuth();
  }, [location.search, dispatch, isInitialized]);

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
