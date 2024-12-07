import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // Custom Button Component
import { Input } from '@/components/ui/input';   // Custom Input Component
import { Label } from '@/components/ui/label';  // Custom Label Component
import { useNavigate } from 'react-router-dom'; // For redirection after success
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate(); // Navigate to another page

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // Simulating a fake password reset API call (replace with real API call)
      const response = await fakePasswordResetAPI(email);
      
      // Show success notification using Toastify
      toast.success('Password reset link sent to your email!', {
        position: toast.POSITION.TOP_CENTER,
      });

      // Redirect to the login page after a successful request
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      // Show error notification using Toastify
      toast.error('Something went wrong. Please try again later.', {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fakePasswordResetAPI = async (email) => {
    // This is a placeholder for an actual API call.
    // Normally, you would make an API request to send a reset password email.
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

        {/* Form */}
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-400'} text-white rounded-xl py-2`}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        {/* Go Back to Login */}
        <div className="mt-4 text-center text-foreground">
          <p className="text-sm">
            Remembered your password? 
            <Link to="/login" className="text-primary hover:text-primary-400"> Login here</Link>
          </p>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
