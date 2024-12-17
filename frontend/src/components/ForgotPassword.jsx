import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!email){
      toast.error("Enter Your email first.")
    }else{
      setIsSubmitting(true);

    try {
      const response = await axios.post(`${import.meta.env.BACKEND_URL}/forgot-password`, { email });

      toast.success('Password reset link sent to your email!');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error('Check your email. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
    }
    
  };

  return (
    <div className="flex justify-center bg-primary items-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-[#222729] rounded-[5px] shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-ourgreen mb-6">Forgot Password</h2>

        <form onSubmit={handleSubmit}>
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-ourgreen hover:bg-primary-400'} text-white rounded-xl py-2`}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-4 text-center text-white">
          <p className="text-sm">
            Remembered your password? 
            <Link to="/login" className="text-white font-bold hover:text-primary-400"> Login</Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
