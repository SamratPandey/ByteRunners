// React import removed - not used
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminPublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.admin);

  if (isAuthenticated) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

export default AdminPublicRoute;
