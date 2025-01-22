import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, Brain, Trophy, Target, TrendingUp, TrendingDown, Activity, ChevronRight } from 'lucide-react';

const DashboardOverview = ({ data }) => {
  const { 
    totalUsers, 
    totalProblems, 
    userGrowth, 
    problemGrowth,
    topPerformers,
    recentActivity 
  } = data;

  const [timeRange, setTimeRange] = useState('daily');

  // Calculate growth rates from the growth arrays
  const calculateGrowthRate = (growthArray) => {
    if (growthArray.length < 2) return 0;
    const current = growthArray[growthArray.length - 1]?.count || 0;
    const previous = growthArray[growthArray.length - 2]?.count || 0;
    return previous ? ((current - previous) / previous * 100).toFixed(1) : 0;
  };

  const userGrowthRate = calculateGrowthRate(userGrowth);
  const problemGrowthRate = calculateGrowthRate(problemGrowth);

  const statsCards = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      change: userGrowthRate,
      changeText: "vs last period",
      color: "text-blue-600"
    },
    {
      title: "Total Problems",
      value: totalProblems.toLocaleString(),
      icon: Brain,
      change: problemGrowthRate,
      changeText: "vs last period",
      color: "text-violet-600"
    },
    {
      title: "Active Users",
      value: (totalUsers * 0.8).toFixed(0),
      icon: Trophy,
      change: "+12.3",
      changeText: "vs last period",
      color: "text-amber-600"
    },
    {
      title: "Avg. Completion Rate",
      value: "68%",
      icon: Target,
      change: "+5.2",
      changeText: "vs last period",
      color: "text-emerald-600"
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border shadow-lg rounded-lg">
          <p className="font-medium text-gray-900 text-sm">{label}</p>
          <p className="text-blue-600 font-semibold text-lg">
            {payload[0].value.toLocaleString()} {payload[0].dataKey === 'users' ? 'users' : 'problems'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-8 bg-gray-50/30">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = !String(stat.change).startsWith('-');
          
          return (
            <Card key={index} className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`flex items-center ${isPositive ? 'text-emerald-600' : 'text-red-600'} font-medium`}>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {stat.change}%
                  </span>
                  <span className="ml-2 text-gray-500">{stat.changeText}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Growth Analytics</CardTitle>
                <p className="text-sm text-gray-500 mt-1">User and problem growth trends</p>
              </div>
              <div className="flex items-center space-x-4">
                {['daily', 'weekly', 'monthly'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`text-sm font-medium ${
                      timeRange === range ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorProblems" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#colorUsers)"
                    name="Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="problems"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#colorProblems)"
                    name="Problems"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Top Performers</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Highest scoring users</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {topPerformers.map((user, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200">
                      <span className="text-blue-700 font-semibold">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <div className="flex items-center mt-1">
                        <Trophy className="h-4 w-4 text-amber-500 mr-1" />
                        <span className="text-sm text-gray-600">Score: {user.score}</span>
                        <Activity className="h-4 w-4 text-emerald-500 ml-2 mr-1" />
                        <span className="text-sm text-gray-600">Solved: {user.problemsSolved}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Latest user interactions</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  activity.status === 'Accepted' ? 'bg-emerald-600' :
                  activity.status === 'Wrong Answer' ? 'bg-red-600' :
                  'bg-amber-600'
                }`} />
                <div>
                  <p className="text-sm text-gray-900 font-medium">{activity.problemTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">by {activity.userName}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                      activity.status === 'Wrong Answer' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {activity.status}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{activity.language}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;