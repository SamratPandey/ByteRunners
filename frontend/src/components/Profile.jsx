import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Profile = () => {
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
        const response = await axios.get('http://localhost:3001/api/auth/profile', {
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
    toast.success('Logged out successfully!');
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
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Profile Section */}
      <div className="max-w-3xl mx-auto bg-card p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-6">
          <img
            src={user.avatar || 'https://via.placeholder.com/100'}
            alt="User Avatar"
            className="w-24 h-24 rounded-full border border-border mr-4"
          />
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <p><strong>Rank:</strong> #{user.rank}</p>
          <p><strong>Problems Solved:</strong> {user.problemsSolved}</p>
          <p><strong>Total Submissions:</strong> {user.totalSubmissions}</p>
          <p><strong>Accuracy:</strong> {user.accuracy}%</p>
          <p><strong>Bio:</strong> {user.bio || 'No bio available'}</p>
        </div>
        <div className="mt-6 text-center">
          <Button onClick={handleLogout} className="bg-destructive hover:bg-destructive-400 text-white">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
