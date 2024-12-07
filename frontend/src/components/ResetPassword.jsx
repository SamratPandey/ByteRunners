import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // Custom Button Component
import { Input } from '@/components/ui/input';   // Custom Input Component
import { Label } from '@/components/ui/label';  // Custom Label Component
import { useNavigate, useParams } from 'react-router-dom'; // For URL parameters
import axios from 'axios'; // For API call
import { toast, ToastContainer } from 'react-toastify'; // For Toastify notifications

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { resetToken } = useParams(); // Get the reset token from the URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        resetToken,
        password,
      });

      toast.success(response.data.message, {
        position: toast.POSITION.TOP_CENTER,
      });

      setTimeout(() => {
        navigate('/login'); // Redirect to login page after password reset
      }, 2000);
    } catch (error) {
      toast.error(error.response.data.message || 'Error resetting password', {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-border">
        <h2 className="text-3xl font-semibold text-center text-primary mb-6">Reset Your Password</h2>

        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="password" className="text-foreground">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full bg-input text-foreground border border-border rounded-lg p-2"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full bg-input text-foreground border border-border rounded-lg p-2"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-400'} text-white rounded-xl py-2`}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
};

export default ResetPassword;
