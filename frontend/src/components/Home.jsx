import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Button } from '@/components/ui/button'; 
import { useDispatch, useSelector } from 'react-redux'; 
import { ClipLoader } from 'react-spinners';  // Optional loading spinner

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access user token from Redux or localStorage
  const { token } = useSelector((state) => state.auth);
  const isLoggedIn = Boolean(token) || Boolean(localStorage.getItem('token')); // Check if user is logged in

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-primary py-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center px-6">
          <Link to="/" className="text-white text-3xl font-semibold">YourApp</Link>
          <div className="space-x-6">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-primary-200">Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-primary-200">Login</Link>
                <Link to="/signup" className="text-white hover:text-primary-200">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-primary py-32">
        <div className="container mx-auto text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome to YourApp</h1>
          <p className="text-xl mb-8">Solve coding challenges, sharpen your skills, and compete with others!</p>
          {isLoggedIn ? (
            <Button
              className="bg-primary-400 hover:bg-primary-500 text-white py-3 px-8 rounded-lg text-xl"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              className="bg-primary-400 hover:bg-primary-500 text-white py-3 px-8 rounded-lg text-xl"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </Button>
          )}
        </div>
      </section>

      {/* Daily Challenge Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-semibold text-foreground mb-6">Today's Challenge</h2>
          <p className="text-lg text-muted mb-10">Take a challenge and improve your coding skills!</p>
          <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-primary mb-4">Problem of the Day</h3>
            <p className="text-xl text-muted mb-6">Level: Easy</p>
            <Link to="/challenges" className="text-primary hover:text-primary-400 text-lg">
              Start the Challenge
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary py-8 mt-auto">
        <div className="container mx-auto text-center text-white">
          <p className="text-sm mb-4">&copy; 2024 YourApp. All rights reserved.</p>
          <div className="space-x-6">
            <Link to="/about" className="text-white hover:text-primary-200">About</Link>
            <Link to="/contact" className="text-white hover:text-primary-200">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
