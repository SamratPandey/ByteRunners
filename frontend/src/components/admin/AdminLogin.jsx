import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../../redux/actions/adminActions';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, error } = useSelector((state) => state.admin);
  // Check if there's an expired token message in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenExpired = params.get('tokenExpired');
    
    if (tokenExpired === 'true') {
      // Clear the token and show a message
      dispatch(logout());
      toast.error('Your session has expired. Please log in again.');
      
      // Remove the query parameter from the URL without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin-dashboard'); // Redirect if logged in
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    let isValid = true;
    if (!email) {
      toast.error('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Invalid email format');
      isValid = false;
    }

    if (!password) {
      toast.error('Password is required');
      isValid = false;
    }
    return isValid;
  };
  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    const result = await dispatch(login(email, password));
    if (result) {
      toast.success('Logged in successfully!');
    } else {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex justify-center bg-black items-center min-h-screen">
      <div className="w-full max-w-sm p-8 bg-gray-950 rounded-lg shadow-lg border border-gray-800">
        <h2 className="text-3xl font-semibold text-center text-green-400 mb-6">
          Admin Panel
        </h2>
        <div className="mb-4">
          <Label htmlFor="email" className="text-gray-300">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full bg-gray-900 text-white border-gray-700 rounded-lg p-2 placeholder-gray-400"
          />
        </div>
        <div className="mb-6">
          <Label htmlFor="password" className="text-gray-300">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full bg-gray-900 text-white border-gray-700 rounded-lg p-2 placeholder-gray-400"
          />
        </div>
        <Button
          onClick={handleLogin}
          disabled={isSubmitting}
          variant="success"
          className="w-full py-2"
        >
          {isSubmitting ? <ClipLoader color="#fff" size={20} /> : 'Log In'}
        </Button>

        <div className="mt-4 text-center text-gray-600">          <p className="text-sm">
            Not an admin? 
            <Link to="/user-login" className="text-primary font-medium hover:text-primary/80"> User Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
