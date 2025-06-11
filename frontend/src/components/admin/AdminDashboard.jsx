import React, { useState, useEffect } from 'react';
import axios from 'axios';
import adminApi from '../../utils/adminApi';
import UserManagement from "./UserManagement";
import DashboardOverview from "./DashboardOverview";
import ProblemManagement from './ProblemManagement';
import JobManagement from './JobManagement';
import CourseManagement from './CourseManagement';
import OrderManagement from './OrderManagement';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnalyticsCardSkeleton } from '@/components/ui/skeleton';
import { Users, Code, BarChart, Settings, LogOut, BookOpen, ShoppingCart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, checkAdminAuthStatus } from '../../redux/actions/adminActions';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    totalProblems: 0,
    userGrowth: [],
    problemGrowth: [],
    users: [],
    topPerformers: [],
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.admin);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await dispatch(checkAdminAuthStatus());
      setAuthChecked(true);
      if (!isAuth) {
        toast.error('Please log in to access admin dashboard');
        window.location.href = '/admin/login';
      }
    };
    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    // Only fetch data if authenticated and auth has been checked
    if (authChecked && isAuthenticated) {
      fetchData();
    }
  }, [authChecked, isAuthenticated]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Use Promise.allSettled to handle partial failures gracefully
      const promises = [
        adminApi.get('/api/admin/user-stats'),
        adminApi.get('/api/admin/problem-stats'),
        adminApi.get('/api/admin/users'),
        adminApi.get('/api/admin/top-performers'),
        adminApi.get('/api/admin/recent-activity')
      ];

      const results = await Promise.allSettled(promises);
      
      // Extract data from successful requests
      const [statsResult, problemStatsResult, usersResult, topPerformersResult, recentActivityResult] = results;

      setAdminData({
        totalUsers: statsResult.status === 'fulfilled' ? (statsResult.value.data?.data?.totalUsers || 0) : 0,
        totalProblems: problemStatsResult.status === 'fulfilled' ? (problemStatsResult.value.data?.data?.totalProblems || 0) : 0,
        userGrowth: statsResult.status === 'fulfilled' ? (statsResult.value.data?.data?.userGrowth || []) : [],
        problemGrowth: problemStatsResult.status === 'fulfilled' ? (problemStatsResult.value.data?.data?.problemGrowth || []) : [],
        users: usersResult.status === 'fulfilled' ? (usersResult.value.data?.data || []) : [],
        topPerformers: topPerformersResult.status === 'fulfilled' ? (topPerformersResult.value.data?.data || []) : [],
        recentActivity: recentActivityResult.status === 'fulfilled' ? (recentActivityResult.value.data?.data || []) : [],
      });

      // Log any failed requests for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Admin API request ${index} failed:`, result.reason);
        }
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/admin/login';
  };  const renderActiveComponent = () => {
    if (isLoading) {
      return <AnalyticsCardSkeleton />;
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardOverview
            data={adminData}
          />
        );
      case 'users':
        return <UserManagement users={adminData.users} />;
      case 'problems':
        return <ProblemManagement />
      case 'jobs':
        return <JobManagement />
      case 'courses':
        return <CourseManagement />
      case 'orders':
        return <OrderManagement />
      default:
        return <DashboardOverview data={adminData} />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-green-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-700 ${
              activeSection === 'dashboard' ? 'bg-green-700' : ''
            }`}
            onClick={() => setActiveSection('dashboard')}
          >
            <BarChart className="mr-2" /> Dashboard
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-700 ${
              activeSection === 'users' ? 'bg-green-700' : ''
            }`}
            onClick={() => setActiveSection('users')}
          >
            <Users className="mr-2" /> User Management
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-700 ${
              activeSection === 'problems' ? 'bg-green-700' : ''
            }`}
            onClick={() => setActiveSection('problems')}
          >
            <Code className="mr-2" /> Problem Management
          </Button>          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-700 ${
              activeSection === 'jobs' ? 'bg-green-700' : ''
            }`}
            onClick={() => setActiveSection('jobs')}
          >
            <Code className="mr-2" /> Job Management
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-700 ${
              activeSection === 'courses' ? 'bg-green-700' : ''
            }`}
            onClick={() => setActiveSection('courses')}
          >
            <BookOpen className="mr-2" /> Course Management
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-700 ${
              activeSection === 'orders' ? 'bg-green-700' : ''
            }`}
            onClick={() => setActiveSection('orders')}
          >
            <ShoppingCart className="mr-2" /> Order Management
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start mt-4 bg-red-600 hover:bg-red-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-2" /> Logout
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-white overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
        </div>

        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
