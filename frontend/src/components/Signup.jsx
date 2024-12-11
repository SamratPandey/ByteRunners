import React, { useState } from 'react';
import { Button } from '@/components/ui/button';  
import { Input } from '@/components/ui/input';    
import { Label } from '@/components/ui/label';    
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

  // Form validation
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
    <div className="flex justify-center items-center min-h-screen bg-primary">
      <div className="w-full max-w-md p-8 bg-[#222729] rounded-[5px] shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-ourgreen mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name" className="text-white">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="mt-2 w-full bg-input text-black border border-border rounded-lg p-2"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="email" className="text-white">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="mt-2 w-full bg-input text-black border border-border rounded-lg p-2"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="mt-2 w-full bg-input text-black border border-border rounded-lg p-2"
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-2 w-full bg-input text-black border border-border rounded-lg p-2"
            />
          </div>
          <div className="flex items-center text-white my-4">
          <div className="flex-grow border-t border-border"></div>
          <span className="mx-4">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <div className="mb-5 flex justify-center gap-4">
          <Button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faGoogle} className="text-white" />
          </Button>
          <Button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faGithub} className="text-white" /> 
          </Button>
          <Button className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 flex items-center gap-2">
           <FontAwesomeIcon icon={faLinkedin} className="text-white" />
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faFacebook} className="text-white" />
          </Button>
        </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-ourgreen hover:bg-primary-400'} text-white rounded-xl py-2`}
          >
            {isSubmitting ? <ClipLoader color="#fff" size={20} /> : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-4 text-center text-white">
          <p className="text-sm">
            Already a ByteRunners? 
            <Link to="/login" className="text-white font-bold hover:text-primary-400"> Login</Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;
