import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/actions/authActions';
import { Link, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons';



const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, isAuthenticated, error  } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
      toast.error(newErrors.email);
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      toast.error(newErrors.email);
    }

    if (!password) {
      newErrors.password = 'Password is required';
      toast.error(newErrors.password);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
  
    setIsSubmitting(true);
  
    await dispatch(login(email, password));
  
    if (isAuthenticated) {
      toast.success('Logged in successfully!');
      navigate('/');
    } else if (error) {
      setEmail('');
      setPassword('');
      toast.error(error);
    }
  
    setIsSubmitting(false);
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
          <div className="space-y-3">
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
                className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input type="checkbox" id="rememberMe" className="mr-2" />
                <Label htmlFor="rememberMe" className="text-gray-300 text-sm">
                  Remember Me
                </Label>
              </div>
              <Link to="/forgot-password" className="text-green-500 hover:text-green-400 text-sm">
                Forgot Password?
              </Link>
            </div>

            <Button
              onClick={handleLogin}
              className={`w-full ${
                isSubmitting ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'
              } text-white relative group overflow-hidden`}
            >
              <span className="relative z-10">
                {isSubmitting ? <ClipLoader color="#fff" size={20} /> : 'Log In'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-green-900"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: faGoogle, bg: 'bg-blue-600 hover:bg-blue-700' },
                { icon: faGithub, bg: 'bg-gray-800 hover:bg-gray-900' },
              ].map((social, index) => (
                <Button key={index} className={`${social.bg} text-white`}>
                  <FontAwesomeIcon icon={social.icon} />
                </Button>
              ))}
            </div>

            <div className="text-center text-gray-400">
              <p className="text-sm">
                New at ByteRunners?{' '}
                <Link to="/signup" className="text-green-500 hover:text-green-400 font-semibold">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
