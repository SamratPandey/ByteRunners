import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import logo from '../../src/assets/logo.png';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!email) {
      toast.error('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, { email });
      
      toast.success('Password reset link sent to your email!');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error('Check your email. Please try again later.');
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-1 flex items-center justify-center relative z-10">
        <Card className="w-full max-w-sm p-8 bg-black/80 backdrop-blur-sm border border-green-900 shadow-xl">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 blur-xl opacity-20" />
            <Link to="/" className="relative flex flex-col items-center">
              <img src={logo} alt="logo" className="w-2/3 mb-4" />
            </Link>
          </div>
          <div className="space-y-4">
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

            <Button
              onClick={handleSubmit}
              className={`w-full ${
                isSubmitting ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'
              } text-white relative group overflow-hidden`}
            >
              <span className="relative z-10">
                {isSubmitting ? <ClipLoader color="#fff" size={20} /> : 'Send Reset Link'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>

            <div className="text-center text-gray-400">
              <p className="text-sm">
                Remembered your password?{' '}
                <Link to="/login" className="text-green-500 hover:text-green-400 font-semibold">
                  Log In
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

export default ForgotPassword;