import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import authApi from '../utils/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/actions/authActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnalyticsCardSkeleton } from '@/components/ui/skeleton';
import { User, Code, Trophy, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DifficultyBadge = ({ difficulty }) => {
  const colors = {
    Easy: 'bg-green-500',
    Medium: 'bg-yellow-500',
    Hard: 'bg-red-500'
  };
  
  return (
    <Badge className={`${colors[difficulty]} text-white`}>
      {difficulty}
    </Badge>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      setShouldRedirect(true);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await authApi.get('/dashboard');
        setUser(response.data);
        setIsLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          dispatch(logout());
          toast.error('Your session has expired. Please log in again to continue.', {
            style: {
              background: '#ef4444',
              color: 'white',
              fontWeight: '500'
            },
            duration: 4000
          });
          setShouldRedirect(true);
        } else {
          toast.error('Unable to load your dashboard data. Please refresh the page or try again later.', {
            style: {
              background: '#ef4444',
              color: 'white',
              fontWeight: '500'
            },
            duration: 4000
          });
        }
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/login', { replace: true });
    }
  }, [shouldRedirect, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    setUser(null);
    toast.success('👋 You\'ve been logged out successfully! Thanks for using ByteRunners!', {
      style: {
        background: '#22c55e',
        color: 'white',
        fontWeight: '500'
      },
      duration: 3000
    });
    setShouldRedirect(true);
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <AnalyticsCardSkeleton />
      </div>
    );
  }

  if (shouldRedirect) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user.avatar || "/api/placeholder/100/100"}
              alt="Profile"
              className="w-16 h-16 rounded-full border-4 border-primary"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Welcome back, {user.name}!</h1>
            <p className="text-gray-600 dark:text-gray-300">Rank #{user.rank} | ⭐ {user.streak} day streak</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Code className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Problems Solved</p>
                <h3 className="text-2xl font-bold">{user.problemsSolved}/{user.totalProblems}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Global Rank</p>
                <h3 className="text-2xl font-bold">#{user.rank}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Star className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                <h3 className="text-2xl font-bold">{user.streak} days</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <User className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Score</p>
                <h3 className="text-2xl font-bold">{user.score || user.problemsSolved * 10}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {user.progressData && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={user.progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="problems" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {user.recentActivity && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="font-medium dark:text-white">{activity.problem}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.timestamp}</p>
                    </div>
                    <DifficultyBadge difficulty={activity.difficulty} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {user.stats && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Problem-Solving Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(user.stats).map(([difficulty, percentage]) => (
                  <div key={difficulty}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium dark:text-white">
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Problems
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="bg-gray-200 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;