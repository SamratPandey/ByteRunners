import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signup } from '../redux/actions/authActions';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faGithub, faLinkedin, faFacebook } from '@fortawesome/free-brands-svg-icons';



const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;

    if (!formData.name) {
      toast.error('Full name is required');
      isValid = false;
    }

    if (!formData.email) {
      toast.error('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Email is not valid');
      isValid = false;
    }

    if (!formData.password) {
      toast.error('Password is required');
      isValid = false;
    } else if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await dispatch(signup(formData.name, formData.email, formData.password));
      toast.success('Account created successfully! You can now log in.');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error('Failed to create an account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
 
      <div className="flex-1 flex items-center justify-center relative z-10">
        <Card className="w-full max-w-sm p-8 bg-black/80 backdrop-blur-sm border border-green-900 shadow-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 blur-xl opacity-20" />
            <Link to={"/"} className="relative flex flex-col items-center">
              <img src="/images/logo.png" alt="logo" className="w-2/3 mb-4" />
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <Label htmlFor="name" className="text-gray-300">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-2 bg-black/50 border-green-900 text-white placeholder:text-gray-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white relative group overflow-hidden"
            >
              <span className="relative z-10">
                {isSubmitting ? <ClipLoader color="#fff" size={20} /> : 'Sign Up'}
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
                { icon: faGoogle, bg: 'bg-red-600 hover:bg-red-700' },
                { icon: faGithub, bg: 'bg-gray-800 hover:bg-gray-900' }
              ].map((social, index) => (
                <Button 
                  key={index} 
                  type="button"
                  className={`${social.bg} text-white transition-all duration-200`}
                >
                  <FontAwesomeIcon icon={social.icon} />
                </Button>
              ))}
            </div>

            <div className="text-center text-gray-400">
              <p className="text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-green-500 hover:text-green-400 font-semibold">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;