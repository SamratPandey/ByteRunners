import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserManagement from "./UserManagement";
import DashboardOverview from "./DashboardOverview";
import ProblemManagement from './ProblemManagement';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Code, BarChart, Settings, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    totalProblems: 0,
    userGrowth: [],
    users: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('adminToken');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user statistics
        const statsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/user-stats`, { headers });
        const statsData = statsResponse.data;

        // Fetch all users
        const usersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, { headers });
        const usersData = usersResponse.data;

        // Simulate fetching total problems (replace with actual endpoint if needed)
        const totalProblems = 100; // Replace with API response when available

        setAdminData({
          totalUsers: statsData?.data?.totalUsers || 0,
          totalProblems,
          userGrowth: statsData?.data?.userGrowth || [],
          users: usersData?.data || [],
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (error.response && error.response.status === 401) {
          window.location.href = '/admin/login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const renderActiveComponent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full">Loading...</div>;
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardOverview
            data={{
              totalUsers: adminData.totalUsers,
              totalProblems: adminData.totalProblems,
            }}
          />
        );
      case 'users':
        return <UserManagement users={adminData.users} />;
      case 'problems':
        return <ProblemManagement />
      default:
        return <DashboardOverview data={adminData} />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Changed colors to green */}
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
            <Users className="mr-2" /> Problem Management
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-700 ${
              activeSection === 'analytics' ? 'bg-green-700' : ''
            }`}
            onClick={() => setActiveSection('analytics')}
          >
            <Settings className="mr-2" /> Analytics
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

      {/* Main Content - Changed background to white */}
      <div className="flex-1 p-8 bg-white overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
        </div>

        {/* Stats Overview */}
        {activeSection === 'dashboard' && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-green-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{adminData.totalUsers}</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Total Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{adminData.totalProblems}</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(adminData.totalUsers * 0.7)} {/* Example active users calculation */}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default AdminDashboard;