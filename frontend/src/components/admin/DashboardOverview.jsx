import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, Users, Brain, Trophy, Target, TrendingUp, TrendingDown, Activity, ChevronRight } from 'lucide-react';

const getActivityIcon = (type) => {
  switch (type) {
    case 'User Logged In':
      return <User className="w-4 h-4 text-blue-500" />;
    case 'User Registered':
      return <Activity className="w-4 h-4 text-green-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case 'User Logged In':
      return {
        dot: 'bg-blue-600',
        badge: 'bg-blue-100 text-blue-700'
      };
    case 'User Registered':
      return {
        dot: 'bg-green-600',
        badge: 'bg-green-100 text-green-700'
      };
    default:
      return {
        dot: 'bg-gray-600',
        badge: 'bg-gray-100 text-gray-700'
      };
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
};

const RecentActivityLog = ({ activities }) => {
  // Use only real data - no fallback
  const displayActivities = activities && Array.isArray(activities) ? activities : [];

  return (
    <div className="bg-gray-950 shadow-md rounded-lg overflow-hidden border border-gray-800">
      <div className="px-6 py-4 bg-gray-900 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
      </div>      <div className="divide-y divide-gray-800">
        {displayActivities.length > 0 ? displayActivities.map((activity) => {
          const { dot, badge } = getActivityColor(activity.type);
          
          return (
            <div 
              key={activity._id} 
              className="px-6 py-4 hover:bg-gray-900 transition-colors flex items-start space-x-4"
            >
              <div className={`w-2 h-2 mt-2 rounded-full ${dot}`} />
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
                      {getActivityIcon(activity.type)}
                      <span>{formatTimestamp(activity.timestamp)}</span>
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${badge}`}>
                    {activity.type}
                  </span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-400 text-sm">No recent activity available</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardOverview = ({ data }) => {
  const { 
    totalUsers, 
    totalProblems, 
    topPerformers,
    recentActivity 
  } = data;

  const statsCards = [
    {
      title: "Total Users",
      value: (totalUsers || 0).toLocaleString(),
      icon: Users,
      change: "0",
      changeText: "vs last period",
      color: "text-green-500"
    },    {
      title: "Total Problems",
      value: (totalProblems || 0).toLocaleString(),
      icon: Brain,
      change: "0",
      changeText: "vs last period",
      color: "text-blue-500"
    },
    {
      title: "Active Users",
      value: "N/A",
      icon: Trophy,
      change: "0",
      changeText: "data not available",
      color: "text-yellow-500"
    },
    {
      title: "Completion Rate",
      value: "N/A",
      icon: Target,
      change: "0",
      changeText: "data not available",
      color: "text-green-500"
    }  ];

  return (
    <div className="space-y-6 p-8 bg-black text-white min-h-screen">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = !String(stat.change).startsWith('-');
          
          return (
            <Card key={index} className="bg-gray-950 border-gray-800 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-2 text-white">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'} font-medium`}>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {stat.change}%
                  </span>
                  <span className="ml-2 text-gray-400">{stat.changeText}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>      {/* Main Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Top Performers */}
        <Card className="bg-gray-950 border-gray-800 shadow-md">
          <CardHeader className="border-b border-gray-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-white">Top Performers</CardTitle>
                <p className="text-sm text-gray-400 mt-1">Highest scoring users</p>
              </div>
            </div>
          </CardHeader><CardContent className="pt-6">
            <div className="space-y-6">
              {(topPerformers && topPerformers.length > 0) ? topPerformers.map((user, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-gray-900 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-900 to-green-800 flex items-center justify-center border border-green-700">
                      <span className="text-green-300 font-semibold">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <div className="flex items-center mt-1">
                        <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-400">Score: {user.score}</span>
                        <Activity className="h-4 w-4 text-green-500 ml-2 mr-1" />
                        <span className="text-sm text-gray-400">Solved: {user.problemsSolved}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No top performers data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>      {/* Recent Activity */}
      <Card className="bg-gray-950 border-gray-800 shadow-md">
        <CardHeader className="border-b border-gray-800 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-white">Recent Activity</CardTitle>
              <p className="text-sm text-gray-400 mt-1">Latest user interactions</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
            <RecentActivityLog activities={recentActivity}/>

        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;