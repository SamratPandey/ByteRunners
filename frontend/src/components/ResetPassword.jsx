import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { resetToken } = useParams();

  const validateForm = () => {
    if (!password) {
      toast.error('Password is required');
      return false;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`, {
        resetToken,
        password,
      });
      toast.success(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error resetting password');
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
              <img src="/images/logo.png" alt="logo" className="w-2/3 mb-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-gray-300">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isSubmitting ? <ClipLoader color="#fff" size={20} /> : 'Reset Password'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>

            <div className="text-center text-gray-400">
              <p className="text-sm">
                Remembered your password?{' '}
                <Link to="/login" className="text-green-500 hover:text-green-400 font-semibold">
                  Log In
                </Link>
              </p>          </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;