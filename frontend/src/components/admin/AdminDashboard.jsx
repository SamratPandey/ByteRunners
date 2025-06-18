import { useState, useEffect } from 'react';
import axios from 'axios';
import adminApi from '../../utils/adminApi';
import UserManagement from "./UserManagement";
import DashboardOverview from "./DashboardOverview";
import ProblemManagement from './ProblemManagement';
import JobManagement from './JobManagement';
import AdminJobApplications from './AdminJobApplications';
import CourseManagement from './CourseManagement';
import OrderManagement from './OrderManagement';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnalyticsCardSkeleton } from '@/components/ui/skeleton';
import { Users, Code, BarChart, Settings, LogOut, BookOpen, ShoppingCart, Briefcase } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, checkAdminAuthStatus } from '../../redux/actions/adminActions';
import { toast } from 'react-hot-toast';

// Background Pattern Component for Admin (matching user style)
const BackgroundPattern = () => (
  <div className="fixed inset-0 pointer-events-none">
    {/* Animated grid pattern */}
    <div 
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: `
          linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'grid-move 20s linear infinite'
      }}
    />
    
    {/* Floating admin symbols */}
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute text-green-500/5 select-none animate-pulse-glow"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 16 + 8}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }}
        >
          {['⚙️', '📊', '👥', '📈', '💼', '📋', '🔧', '📦'][Math.floor(Math.random() * 8)]}
        </div>
      ))}
    </div>
    
    {/* Gradient orbs */}
    <div className="absolute top-1/3 left-1/5 w-48 h-48 bg-green-500/3 rounded-full blur-3xl animate-pulse-glow" />
    <div className="absolute bottom-1/3 right-1/5 w-64 h-64 bg-blue-500/3 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />
  </div>
);

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
        adminApi.get('/api/admin/user-growth-stats'),
        adminApi.get('/api/admin/problem-growth-stats'),
        adminApi.get('/api/admin/users'),
        adminApi.get('/api/admin/top-performers'),
        adminApi.get('/api/admin/recent-activity')
      ];

      const results = await Promise.allSettled(promises);
        // Extract data from successful requests
      const [statsResult, problemStatsResult, userGrowthResult, problemGrowthResult, usersResult, topPerformersResult, recentActivityResult] = results;

      // Log the raw API responses for debugging
      console.log('Stats API Response:', statsResult);
      console.log('Problem Stats API Response:', problemStatsResult);
      console.log('User Growth API Response:', userGrowthResult);
      console.log('Problem Growth API Response:', problemGrowthResult);
      
      const adminDataUpdate = {
        totalUsers: statsResult.status === 'fulfilled' ? (statsResult.value.data?.data?.totalUsers || statsResult.value.data?.totalUsers || 0) : 0,
        totalProblems: problemStatsResult.status === 'fulfilled' ? (problemStatsResult.value.data?.data?.totalProblems || problemStatsResult.value.data?.totalProblems || 0) : 0,
        userGrowth: userGrowthResult.status === 'fulfilled' ? (userGrowthResult.value.data?.data?.userGrowth || userGrowthResult.value.data?.userGrowth || []) : [],
        problemGrowth: problemGrowthResult.status === 'fulfilled' ? (problemGrowthResult.value.data?.data?.problemGrowth || problemGrowthResult.value.data?.problemGrowth || []) : [],
        users: usersResult.status === 'fulfilled' ? (usersResult.value.data?.data || usersResult.value.data?.users || []) : [],
        topPerformers: topPerformersResult.status === 'fulfilled' ? (topPerformersResult.value.data?.data || topPerformersResult.value.data?.topPerformers || []) : [],
        recentActivity: recentActivityResult.status === 'fulfilled' ? (recentActivityResult.value.data?.data || recentActivityResult.value.data?.activities || []) : [],
      };

      console.log('Processed admin data:', adminDataUpdate);
      setAdminData(adminDataUpdate);

      // Log any failed requests for debugging
      results.forEach((result, index) => {
        const apiNames = ['user-stats', 'problem-stats', 'user-growth-stats', 'problem-growth-stats', 'users', 'top-performers', 'recent-activity'];
        if (result.status === 'rejected') {
          console.error(`Admin API request ${apiNames[index]} failed:`, result.reason);
          // Show a toast for failed requests
          toast.error(`Failed to load ${apiNames[index].replace('-', ' ')}`);
        } else {
          console.log(`✅ ${apiNames[index]} loaded successfully`);
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
        return <UserManagement users={adminData.users} />;      case 'problems':
        return <ProblemManagement />;
      case 'jobs':
        return <JobManagement />;
      case 'job-applications':
        return <AdminJobApplications />;
      case 'courses':
        return <CourseManagement />;
      case 'orders':
        return <OrderManagement />;
      default:
        return <DashboardOverview data={adminData} />;
    }
  };
  return (    <div className="flex h-screen bg-black relative">
      {/* Background Pattern */}
      <BackgroundPattern />
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 text-white p-4 relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-green-500">Admin Panel</h2>
        <nav>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-500/10 hover:text-green-400 ${
              activeSection === 'dashboard' ? 'bg-green-500/20 text-green-400' : ''
            }`}
            onClick={() => setActiveSection('dashboard')}
          >
            <BarChart className="mr-2" /> Dashboard
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-500/10 hover:text-green-400 ${
              activeSection === 'users' ? 'bg-green-500/20 text-green-400' : ''
            }`}
            onClick={() => setActiveSection('users')}
          >
            <Users className="mr-2" /> User Management
          </Button>          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-500/10 hover:text-green-400 ${
              activeSection === 'problems' ? 'bg-green-500/20 text-green-400' : ''
            }`}
            onClick={() => setActiveSection('problems')}
          >
            <Code className="mr-2" /> Problem Management
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-500/10 hover:text-green-400 ${
              activeSection === 'jobs' ? 'bg-green-500/20 text-green-400' : ''
            }`}
            onClick={() => setActiveSection('jobs')}
          >
            <Briefcase className="mr-2" /> Job Management
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-500/10 hover:text-green-400 ${
              activeSection === 'job-applications' ? 'bg-green-500/20 text-green-400' : ''
            }`}
            onClick={() => setActiveSection('job-applications')}
          >
            <Users className="mr-2" /> Job Applications
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-500/10 hover:text-green-400 ${
              activeSection === 'courses' ? 'bg-green-500/20 text-green-400' : ''
            }`}
            onClick={() => setActiveSection('courses')}
          >
            <BookOpen className="mr-2" /> Course Management
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-500/10 hover:text-green-400 ${
              activeSection === 'orders' ? 'bg-green-500/20 text-green-400' : ''
            }`}
            onClick={() => setActiveSection('orders')}
          >
            <ShoppingCart className="mr-2" /> Order Management
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start mt-4"
            onClick={handleLogout}
          >
            <LogOut className="mr-2" /> Logout
          </Button>
        </nav>
      </div>      {/* Main Content */}
      <div className="flex-1 p-8 bg-black text-white overflow-y-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-400">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
        </div>

        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
