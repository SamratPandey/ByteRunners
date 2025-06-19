import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useDispatch, useSelector } from 'react-redux';
import { signup, checkAuthStatus } from '../redux/actions/authActions';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast, Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import authApi from '../utils/authApi';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();  // Get redirect path from location state or default to onboarding
  const from = location.state?.from?.pathname || '/onboarding';
  
  // Only redirect if already authenticated (not during signup process)
  useEffect(() => {
    if (isAuthenticated && !isSubmitting) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate, isSubmitting]);
  // Handle Redux auth errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle OAuth signup
  const handleOAuthSignup = async (provider) => {
    try {
      // Redirect to backend OAuth endpoint
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      window.location.href = `${backendUrl}/api/auth/${provider}`;    } catch (error) {
      toast.error(`Failed to initiate ${provider} signup`, {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        }
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name || name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (at least 2 characters)';
    }

    if (!email) {
      newErrors.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
    }

    if (!password) {
      newErrors.password = 'Please create a password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptPolicy) {
      newErrors.policy = 'Please accept our Privacy Policy and Terms of Service to continue';
    }

    // Show user-friendly error message
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError, {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        }
      });
    }    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
      try {      const success = await dispatch(signup(name, email, password));
      
      if (success) {
        toast.success('Welcome to ByteRunners! Please verify your email to continue.', {
          duration: 3000,
          style: {
            background: '#10b981',
            color: 'white',
            fontWeight: '500'
          }
        });
        
        // Redirect to email verification with user's email
        setTimeout(() => {
          navigate('/verify-email', { 
            state: { email: email }
          });
        }, 2000);
      }} catch (err) {
      toast.error('Unable to create your account. Please check your details and try again.', {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignup(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-1 flex items-center justify-center relative z-10">
        <Card className="w-full max-w-sm p-8 bg-black/80 backdrop-blur-sm border border-green-900 shadow-xl">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 blur-xl opacity-20" />
            <Link to="/" className="relative flex flex-col items-center">
              <img src="/images/logo.png" alt="logo" className="w-2/3 mb-4" />
            </Link>
          </div>
            <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email" className="text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>            <div>
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500 pr-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500 pr-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="acceptPolicy" 
                  checked={acceptPolicy}
                  onChange={(e) => setAcceptPolicy(e.target.checked)}
                  className="mr-2" 
                />
                <Label htmlFor="acceptPolicy" className="text-gray-300 text-sm">
                  I accept the{' '}
                  <Link to="/privacy" className="text-green-500 hover:text-green-400">
                    Privacy Policy
                  </Link>
                  {' '}and{' '}
                  <Link to="/terms" className="text-green-500 hover:text-green-400">
                    Terms of Service
                  </Link>
                </Label>
              </div>
            </div>
            {errors.policy && (
              <p className="text-red-500 text-sm mt-1">{errors.policy}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${
                isSubmitting ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'
              } text-white relative group overflow-hidden`}
            >
              <span className="relative z-10">
                {isSubmitting ? <ClipLoader color="#fff" size={20} /> : 'Sign Up'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </form>

          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-green-900"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">Or continue with</span>
            </div>
          </div>          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { icon: faGoogle, variant: 'info', name: 'Google' },
              { icon: faGithub, variant: 'secondary', name: 'GitHub' },
            ].map((social, index) => (
              <Button 
                key={index} 
                type="button"
                variant={social.variant}
                className="font-medium"
                onClick={() => handleOAuthSignup(social.name.toLowerCase())}
              >
                <FontAwesomeIcon icon={social.icon} />
              </Button>
            ))}
          </div>          <div className="text-center text-gray-400 mt-4">
            <p className="text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-green-500 hover:text-green-400 font-semibold">
                Log in
              </Link>
            </p>
          </div>        </Card>
      </div>
      <Toaster position="bottom-right" />
    </div>  );
};

export default Signup;
