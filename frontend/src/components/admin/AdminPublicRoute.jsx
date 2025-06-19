import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAdminAuthStatus } from '../../redux/actions/adminActions';

const AdminPublicRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.admin);

  // Check admin auth when accessing admin public routes
  useEffect(() => {
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);

  if (isAuthenticated) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

export default AdminPublicRoute;
