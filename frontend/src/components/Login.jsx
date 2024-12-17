import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';    
import { Label } from '@/components/ui/label';  
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/actions/authActions'; 
import { Link, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';  
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; // For Google and GitHub icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faGithub, faLinkedin, faFacebook } from '@fortawesome/free-brands-svg-icons';  // FontAwesome for Google & GitHub icons

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
      toast.error(newErrors.email); // Toast error for email if it's empty
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      toast.error(newErrors.email); // Toast error for invalid email format
    }

    if (!password) {
      newErrors.password = 'Password is required';
      toast.error(newErrors.password); // Toast error for password if empty
    }

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
      toast.success('Invalid email or password. Please try again.');
      setErrors({ api: err.message || 'Login failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center bg-primary items-center min-h-screen">
      <div className="w-full max-w-sm p-8 bg-[#222729] rounded-[5px] shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-ourgreen mb-6">
          ByteRunners
        </h2>
        <div className="mb-4">
          <Label htmlFor="email" className="text-white">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full bg-input text-black border rounded-lg p-2"
          />
        </div>
        <div className="mb-6">
          <Label htmlFor="password" className="text-white">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full bg-input text-black border rounded-lg p-2"
          />
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                className="mr-2"
              />
              <Label htmlFor="rememberMe" className="text-white">Remember Me</Label>
            </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-white hover:text-primary-400 text-sm">
                  Forgot Password?
                </Link>
              </div>
        
          </div>

        </div>
        
        <div className="flex items-center text-white my-4">
          <div className="flex-grow border-t border-border"></div>
          <span className="mx-4">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <div className="mb-5 flex justify-center gap-4">
          <Button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faGoogle} className="text-white" />
          </Button>
          <Button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faGithub} className="text-white" /> 
          </Button>
          <Button className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 flex items-center gap-2">
           <FontAwesomeIcon icon={faLinkedin} className="text-white" />
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faFacebook} className="text-white" />
          </Button>
        </div>
        <Button
          onClick={handleLogin}
          className={`w-full ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-ourgreen hover:bg-primary-400'} text-white rounded-xl py-2`}
        >
          {isSubmitting ? <ClipLoader color="#fff" size={20} /> : 'Log In'}
        </Button>
        <div className="mt-4 text-center text-white">
          <p className="text-sm">
            New at ByteRunners? 
            <Link to="/signup" className="text-white font-bold hover:text-primary-400"> Create an account</Link>
          </p>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
