import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/auth/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        setUser(response.data); 
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Please login to access the dashboard');
          navigate('/login', { replace: true });
        } else {
          toast.error('Failed to fetch user data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, token]); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully!');

    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Don't render the dashboard if no user data is available
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">Rank: #{user.rank} | Problems Solved: {user.problemsSolved}</p>
        </div>
        <div className="flex items-center">
          <img
            src={user.avatar || 'https://via.placeholder.com/50'}
            alt="User Avatar"
            className="w-16 h-16 rounded-full border border-border mr-4"
          />
          <Button onClick={handleLogout} className="bg-destructive hover:bg-destructive-400 text-white">
            Logout
          </Button>
        </div>
      </div>

      {/* Progress and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <div className="bg-card rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Progress</h2>
          <div className="h-6 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${(user.problemsSolved / 100) * 100}%` }}></div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{user.problemsSolved}% Problems Solved</p>
        </div>

        {/* Quick Links */}
        <div className="bg-card rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <a href="/problems" className="text-primary hover:underline">
                Solve Problems
              </a>
            </li>
            <li>
              <a href="/contests" className="text-primary hover:underline">
                Join Contests
              </a>
            </li>
            <li>
              <a href="/settings" className="text-primary hover:underline">
                Account Settings
              </a>
            </li>
          </ul>
        </div>

        {/* Statistics */}
        <div className="bg-card rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <p>Total Submissions: {user.totalSubmissions}</p>
          <p>Accepted: {user.accepted}</p>
          <p>Accuracy: {user.accuracy}%</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-card rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <ul className="divide-y divide-border">
          {user.recentActivity.map((activity, index) => (
            <li className="py-2" key={index}>
              <p>{activity.problemTitle} - {activity.status}</p>
              <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
