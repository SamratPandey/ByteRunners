import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';   
import { Label } from '@/components/ui/label';  
import { useNavigate, Link } from 'react-router-dom'; 
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const response = await fakePasswordResetAPI(email);
      toast.success('Password reset link sent to your email!');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
        console.log(error);
        toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fakePasswordResetAPI = async (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email) resolve('Success');
        else reject('Error');
      }, 2000);
    });
  };

  return (
    <div className="bg-background min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-border">
        <h2 className="text-3xl font-semibold text-center text-primary mb-6">Forgot Password</h2>

        <form onSubmit={handleSubmit}>
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
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-400'} text-white rounded-xl py-2`}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <div className="mt-4 text-center text-foreground">
          <p className="text-sm">
            Remembered your password? 
            <Link to="/login" className="text-primary hover:text-primary-400"> Login here</Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
