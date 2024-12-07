// Dashboard.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/actions/authActions'; // Import logout action
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); 
    navigate('/');   // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Your Dashboard</h1>
        <p className="text-xl text-muted mb-8">Here you can see your progress, challenges, and more!</p>
        <button
          className="bg-green-500 hover:bg-primary-500 text-white py-3 px-8 rounded-lg text-xl"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
