import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Code, 
  BarChart, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Dashboard = () => {
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    totalProblems: 0,
    userGrowth: []
  });

  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/analytics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        const data = await response.json();
        setAdminData(data);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      }
    };

    fetchAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    // Redirect to admin login
    window.location.href = '/admin/login';
  };

  const renderSection = () => {
    switch(activeSection) {
      case 'users':
        return <UserManagement />;
      case 'problems':
        return <ProblemManagement />;
      case 'analytics':
        return <AdminAnalytics data={adminData} />;
      default:
        return <DashboardOverview data={adminData} />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav>
          <Button 
            variant="ghost" 
            className="w-full justify-start mb-2"
            onClick={() => setActiveSection('dashboard')}
          >
            <BarChart className="mr-2" /> Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start mb-2"
            onClick={() => setActiveSection('users')}
          >
            <Users className="mr-2" /> User Management
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start mb-2"
            onClick={() => setActiveSection('problems')}
          >
            <Code className="mr-2" /> Problem Management
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start mb-2"
            onClick={() => setActiveSection('analytics')}
          >
            <Settings className="mr-2" /> Analytics
          </Button>
          <Button 
            variant="destructive" 
            className="w-full justify-start mt-4"
            onClick={handleLogout}
          >
            <LogOut className="mr-2" /> Logout
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-100 overflow-y-auto">
        {renderSection()}
      </div>
    </div>
  );
};

// Placeholder components (you'd implement these fully)
const UserManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>User Management</CardTitle>
    </CardHeader>
    <CardContent>
      {/* User list and management controls */}
    </CardContent>
  </Card>
);

const ProblemManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>Problem Management</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Problem creation and editing controls */}
    </CardContent>
  </Card>
);

const DashboardOverview = ({ data }) => (
  <div className="grid grid-cols-3 gap-4">
    <Card>
      <CardHeader>
        <CardTitle>Total Users</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{data.totalUsers}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Total Problems</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{data.totalProblems}</p>
      </CardContent>
    </Card>
  </div>
);

const AdminAnalytics = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Platform Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Detailed analytics visualization */}
    </CardContent>
  </Card>
);

export default Dashboard;