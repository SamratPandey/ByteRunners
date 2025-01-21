import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Brain, Trophy, Target, ArrowUp, ArrowDown } from 'lucide-react';

const DashboardOverview = ({ data }) => {
  const { totalUsers, totalProblems, userGrowth = [] } = data;
  const calculateGrowth = (current, previous) => {
    return previous ? ((current - previous) / previous * 100).toFixed(1) : 0;
  };

  const currentMonthUsers = userGrowth[userGrowth.length - 1]?.users || 0;
  const previousMonthUsers = userGrowth[userGrowth.length - 2]?.users || 0;
  const userGrowthRate = calculateGrowth(currentMonthUsers, previousMonthUsers);

  const statsCards = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      change: userGrowthRate,
      changeText: "from last month"
    },
    {
      title: "Total Problems",
      value: totalProblems.toLocaleString(),
      icon: Brain,
      change: "+5.2",
      changeText: "new problems added"
    },
    {
      title: "Average Score",
      value: "756",
      icon: Trophy,
      change: "+12.3",
      changeText: "from last month"
    },
    {
      title: "Completion Rate",
      value: "68%",
      icon: Target,
      change: "-2.1",
      changeText: "from last month"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = !(String(stat.change).startsWith('-')); // Updated line here
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-gray-500">
                  <span className={`inline-flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}%
                  </span>
                  {' '}{stat.changeText}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  <div className="flex-1">
                    <p className="text-sm">New user registered</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User Name</p>
                    <p className="text-xs text-gray-500">Score: {1000 - i * 50}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
