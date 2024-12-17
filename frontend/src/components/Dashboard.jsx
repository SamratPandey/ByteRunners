import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Nav from './Nav';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // If no token, set redirect flag
    if (!token) {
      setShouldRedirect(true);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.BACKEND_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setIsLoading(false);
      } catch (error) {
        // Set redirect flag on unauthorized access
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          toast.error('Session expired. Please login again.');
          setShouldRedirect(true);
        } else {
          toast.error('Failed to fetch user data');
        }
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/login', { replace: true });
    }
  }, [shouldRedirect, navigate]);

  const handleLogout = () => {
    // Clear token and set redirect flag
    localStorage.removeItem('token');
    setUser(null);

    // Show logout toast
    toast.success('Logged out successfully!');

    // Set redirect flag instead of direct navigation
    setShouldRedirect(true);
  };

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Prevent rendering if redirect is needed
  if (shouldRedirect) {
    return null;
  }

  // Ensure user exists before rendering
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 pt-24">
      {/* Nav bar always on top */}
      <Nav />

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Welcome, {user.name}</h1>
          <p className="text-muted-foreground text-lg">Rank: #{user.rank} | Problems Solved: {user.problemsSolved}</p>
        </div>
        <div className="flex items-center">
          <img
            src={user.avatar || 'https://via.placeholder.com/50'}
            alt="User Avatar"
            className="w-16 h-16 rounded-full border-2 border-gray-300 mr-4"
          />
          <Button 
            onClick={handleLogout} 
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-md"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Dashboard Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Add your dashboard cards or other content here */}
        <div className="bg-black text-white p-6 rounded-md shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Your Stats</h2>
          <p>Additional user-related stats or info can be added here.</p>
        </div>
        <div className="bg-black text-white p-6 rounded-md shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <p>Details about the user's recent activity can go here.</p>
        </div>
        <div className="bg-black text-white p-6 rounded-md shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
          <p>Your position and other relevant data can go here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
