import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAdminAuthStatus } from '../../redux/actions/adminActions';

const AdminProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.admin);

  // Check admin auth when accessing admin routes
  useEffect(() => {
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

export default AdminProtectedRoute;
