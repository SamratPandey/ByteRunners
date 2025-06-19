import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCheck, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { checkAuthStatus } from '../redux/actions/authActions';
import authApi from '../utils/authApi';

const EmailVerification = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get email from location state or redirect to signup
  const email = location.state?.email;
  
  useEffect(() => {
    if (!email) {
      toast.error('Email address is required for verification');
      navigate('/signup');
      return;
    }
    
    // Auto-send verification email when component mounts
    handleSendVerification();
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendVerification = async () => {
    try {
      setIsResending(true);
      const response = await authApi.post('/api/auth/send-verification', { email });
      
      if (response.data.success) {
        toast.success('Verification code sent to your email!', {
          duration: 4000,
          style: {
            background: '#10b981',
            color: 'white',
            fontWeight: '500'
          }
        });
        setCountdown(60); // 60 second cooldown
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification code';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        }
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code', {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        }
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.post('/api/auth/verify-email', {
        email,
        otp
      });
        if (response.data.success) {
        toast.success('Email verified successfully! Welcome to ByteRunners!', {
          duration: 4000,
          style: {
            background: '#10b981',
            color: 'white',
            fontWeight: '500'
          }
        });
        
        // Check authentication status to update Redux state
        await dispatch(checkAuthStatus());
        
        // Redirect to onboarding after successful verification
        setTimeout(() => {
          navigate('/onboarding');
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(errorMessage, {
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

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    try {
      setIsResending(true);
      const response = await authApi.post('/api/auth/resend-verification', { email });
      
      if (response.data.success) {
        toast.success('New verification code sent!', {
          duration: 3000,
          style: {
            background: '#10b981',
            color: 'white',
            fontWeight: '500'
          }
        });
        setCountdown(60);
        setOtp(''); // Clear current OTP
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification code';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        }
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-1 flex items-center justify-center relative z-10">
        <Card className="w-full max-w-md p-8 bg-black/80 backdrop-blur-sm border border-green-900 shadow-xl">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 blur-xl opacity-20" />
            <Link to="/" className="relative flex flex-col items-center">
              <img src="/images/logo.png" alt="logo" className="w-2/3 mb-4" />
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faEnvelope} className="text-green-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-gray-400">
              We've sent a 6-digit verification code to{' '}
              <span className="text-green-400 font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyEmail} className="space-y-6">
            <div>
              <Label htmlFor="otp" className="text-gray-300 text-center block mb-2">
                Enter Verification Code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500 text-center text-2xl tracking-widest font-mono"
                disabled={isSubmitting}
                maxLength={6}
              />
              <p className="text-gray-500 text-sm mt-2 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className={`w-full ${
                isSubmitting || otp.length !== 6 ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'
              } text-white relative group overflow-hidden`}
            >
              <span className="relative z-10">
                {isSubmitting ? (
                  <ClipLoader color="#fff" size={20} />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                    Verify Email
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-4">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={countdown > 0 || isResending}
              onClick={handleResendCode}
              className="text-green-400 border-green-700 hover:bg-green-900"
            >
              {isResending ? (
                <ClipLoader color="#22c55e" size={16} />
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                <>
                  <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-gray-400 mt-6">
            <p className="text-sm">
              Wrong email?{' '}
              <Link to="/signup" className="text-green-500 hover:text-green-400 font-semibold">
                Sign up again
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
