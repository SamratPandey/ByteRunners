// React import removed - not used
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Code, Target, Activity, TrendingUp, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StatsOverview = ({ adminData }) => {
  // Destructure adminData with default values
  const {
    userGrowth = [],
    totalUsers = 0,
    totalProblems = 0,
    topPerformers = [],
    recentActivity = []
  } = adminData;

  // Calculate growth percentages with null checks
  const userGrowthRate = userGrowth.length > 1 
    ? ((userGrowth[userGrowth.length - 1]?.value - 
        userGrowth[0]?.value) / userGrowth[0]?.value * 100).toFixed(1)
    : 0;
  const activeUsers = 0; // Active users data not available from backend
  const topPerformersCount = topPerformers.length;

  return (
    <div className="space-y-6">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Total Users</CardTitle>
            <Users className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalUsers}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {userGrowthRate}% growth rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Total Problems</CardTitle>
            <Code className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalProblems}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Available coding challenges
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Active Users</CardTitle>
            <Activity className="h-6 w-6 text-purple-500" />
          </CardHeader>          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{activeUsers > 0 ? activeUsers : 'N/A'}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {activeUsers > 0 && totalUsers ? ((activeUsers / totalUsers) * 100).toFixed(1) + '% engagement' : 'Data not available'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium">User Growth Trend</CardTitle>
            <CardDescription>Monthly user registration trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            {userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No growth data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-medium">Top Performers</CardTitle>
              <CardDescription>Users with highest completion rates</CardDescription>
            </div>
            <Award className="h-6 w-6 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.slice(0, 3).map((performer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <span className="text-yellow-700 font-medium">#{index + 1}</span>
                      </div>
                      <span className="font-medium">{performer?.username || 'Unknown User'}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {performer?.completionRate ?? 0}% completion
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No top performers data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
          <CardDescription>Latest user interactions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span>{activity?.description || 'Unknown activity'}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity?.timestamp || 'Unknown time'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No recent activity available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;