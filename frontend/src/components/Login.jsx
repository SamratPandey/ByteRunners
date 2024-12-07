import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';    
import { Label } from '@/components/ui/label';  
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/actions/authActions'; 
import { Link, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';  
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, token } = useSelector((state) => state.auth);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';

    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await dispatch(login(email, password));
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Invalid email or password. Please try again.');
      setErrors({ api: err.message || 'Login failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-border">
        <h2 className="text-3xl font-semibold text-center text-primary mb-6">
          Welcome Back
        </h2>
        <div className="mb-4">
          <Label htmlFor="email" className="text-foreground">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full bg-input text-foreground border border-border rounded-lg p-2"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div className="mb-6">
          <Label htmlFor="password" className="text-foreground">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full bg-input text-foreground border border-border rounded-lg p-2"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>
        <div className="text-right mb-6">
          <Link to="/forgot-password" className="text-primary hover:text-primary-400 text-sm">
            Forgot Password?
          </Link>
        </div>
        <Button
          onClick={handleLogin}
          className={`w-full ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-400'} text-white rounded-xl py-2`}
        >
          {isSubmitting ? <ClipLoader color="#fff" size={20} /> : 'Log In'}
        </Button>
        <div className="mt-4 text-center text-foreground">
          <p className="text-sm">
            Don't have an account? 
            <Link to="/signup" className="text-primary font-bold hover:text-primary-400"> Signup here</Link>
          </p>
        </div>
        {errors.api && <p className="text-red-500 text-center mt-4">{errors.api}</p>}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
