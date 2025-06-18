import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { leaderboardApi } from '../utils/leaderboardApi';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton, CardSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Code,
  Brain,
  FileText,
  Users,
  Crown,
  Flame,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  RotateCcw,
  Filter,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Nav from './Nav';

// Loading skeleton components for leaderboard
const LeaderboardSkeleton = () => (
  <div className="space-y-6">
    {/* Stats skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} className="h-32" />
      ))}
    </div>
    
    {/* User position skeleton */}
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-4 w-16 mx-auto" />
            <Skeleton className="h-6 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
    
    {/* Table skeleton */}
    <TableSkeleton rows={8} columns={6} />
  </div>
);

const LeaderBoard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // State management
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter and pagination state
  const [activeCategory, setActiveCategory] = useState('global');
  const [timeframe, setTimeframe] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  // Categories for leaderboard
  const categories = [
    { id: 'global', name: 'Overall', icon: Trophy, color: 'text-yellow-500' },
    { id: 'problems', name: 'Problems Solved', icon: Code, color: 'text-green-500' },
    { id: 'tests', name: 'Test Performance', icon: Brain, color: 'text-blue-500' },
    { id: 'submissions', name: 'Submissions', icon: FileText, color: 'text-purple-500' },
    { id: 'experience', name: 'Experience', icon: Flame, color: 'text-orange-500' }
  ];

  // Timeframe options
  const timeframes = [
    { id: 'all', name: 'All Time' },
    { id: 'year', name: 'This Year' },
    { id: 'month', name: 'This Month' },
    { id: 'week', name: 'This Week' }
  ];

  useEffect(() => {
    loadLeaderboardData();
    loadStats();
    if (isAuthenticated) {
      loadUserPosition();
    }
  }, [activeCategory, timeframe, currentPage]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeCategory === 'global') {
        response = await leaderboardApi.getGlobalLeaderboard(currentPage, 50, timeframe);
      } else {
        response = await leaderboardApi.getCategoryLeaderboard(activeCategory, currentPage, 50);
      }
      
      setLeaderboardData(response.data.leaderboard);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosition = async () => {
    try {
      const response = await leaderboardApi.getUserPosition();
      setUserPosition(response.data);
    } catch (error) {
      console.error('Error loading user position:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await leaderboardApi.getLeaderboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadLeaderboardData(),
      loadStats(),
      isAuthenticated ? loadUserPosition() : Promise.resolve()
    ]);
    setRefreshing(false);
    toast.success('Leaderboard refreshed!');
  };
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="text-yellow-500 w-5 h-5" />;
      case 2: return <Medal className="text-gray-400 w-5 h-5" />;
      case 3: return <Award className="text-amber-600 w-5 h-5" />;
      default: return <span className="text-xl font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadge = (rank) => {
    if (rank <= 3) {
      const colors = ['bg-yellow-800', 'bg-gray-800', 'bg-amber-800'];
      return `${colors[rank - 1]} text-white`;
    } else if (rank <= 10) {
      return 'bg-blue-500 text-white';
    } else if (rank <= 50) {
      return 'bg-green-500 text-white';
    } else {
      return 'bg-gray-500 text-white';
    }
  };
  const filteredLeaderboard = leaderboardData.filter(user =>
    user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };  return (
    <div className="min-h-screen bg-black relative">
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
        <Nav />
      </div>
      {/* Simple static background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-blue-900/20" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
      </div>
      
      {/* Header Section */}
      <section className="relative pt-24 pb-8 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 relative">
            <Badge className="bg-yellow-500/10 text-yellow-500 mb-4">Competition</Badge>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-green-500 to-blue-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Compete with developers worldwide and track your progress on your coding journey
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
              >
                <RotateCcw 
                  className={`mr-2 w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
                />
                <span>Refresh Rankings</span>
              </Button>
                {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Main Content */}
      <section className="relative py-12 bg-black">
        <div className="container mx-auto px-6">
          {loading ? (
            <LeaderboardSkeleton />
          ) : (
            <>
              {/* Stats Overview */}
              {stats.userStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">                  {[
                    {
                      icon: Code,
                      title: "Problems Solved",
                      value: formatNumber(stats.userStats.totalProblems),
                      color: "text-green-500",
                      bgColor: "bg-green-500/10",
                      borderColor: "border-green-500/20"
                    },
                    {
                      icon: Brain,
                      title: "Total Tests",
                      value: formatNumber(stats.testStats?.totalTests || 0),
                      color: "text-purple-500",
                      bgColor: "bg-purple-500/10",
                      borderColor: "border-purple-500/20"
                    },
                    {
                      icon: TrendingUp,
                      title: "Avg Test Score",
                      value: `${Math.round(stats.testStats?.averageScore || 0)}%`,
                      color: "text-yellow-500",
                      bgColor: "bg-yellow-500/10",
                      borderColor: "border-yellow-500/20"
                    }].map((stat, index) => (
                    <Card key={index} className={`p-6 bg-black/80 backdrop-blur-sm border ${stat.borderColor} hover:border-opacity-60 transition-all duration-300`}>
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                          </div>                          <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                            {React.createElement(stat.icon, { className: `w-6 h-6 ${stat.color}` })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}              {/* User Position Card */}
              {isAuthenticated && userPosition && (
                <Card className="p-6 bg-gradient-to-r from-green-600 to-green-800 backdrop-blur-sm border border-green-500/30 hover:border-green-500/50 transition-all duration-300 mb-12">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                      <div className="flex items-center gap-4 mb-4 lg:mb-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadge(userPosition.currentUser.rank)}`}>
                          {getRankIcon(userPosition.currentUser.rank)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Your Position</h3>
                          <p className="text-green-100">Rank #{userPosition.currentUser.rank} of {formatNumber(userPosition.totalUsers)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                        {[
                          { label: "Points", value: formatNumber(userPosition.currentUser.totalPoints) },
                          { label: "Problems", value: userPosition.currentUser.totalProblemsSolved },
                          { label: "Tests", value: userPosition.currentUser.totalTests },
                          { label: "Level", value: userPosition.currentUser.level }
                        ].map((item, index) => (
                          <div key={index}>
                            <p className="text-green-100 text-sm">{item.label}</p>
                            <p className="text-xl font-bold text-white">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}              {/* Category Filters */}
              <div className="flex flex-wrap gap-3 mb-8 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setCurrentPage(1);
                    }}
                    variant={activeCategory === category.id ? "success" : "outline"}
                    className="flex items-center gap-2 font-medium"
                  >
                    {React.createElement(category.icon, { className: `w-4 h-4 ${category.color}` })}
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Timeframe Filter */}
              {activeCategory === 'global' && (
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                  <span className="text-gray-400 text-sm py-2 pr-2">Time Period:</span>
                  {timeframes.map((tf) => (
                    <Button
                      key={tf.id}
                      onClick={() => {
                        setTimeframe(tf.id);
                        setCurrentPage(1);
                      }}                      variant={timeframe === tf.id ? "info" : "ghost"}
                      size="sm"
                      className="font-medium"
                    >
                      {tf.name}
                    </Button>
                  ))}
                </div>
              )}              {/* Leaderboard Table */}
              <Card className="bg-black/80 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 text-center">
                      <span className="text-gray-300 text-sm font-semibold">Rank</span>
                    </div>
                    <div className="col-span-4">
                      <span className="text-gray-300 text-sm font-semibold">User</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-gray-300 text-sm font-semibold">Points</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-gray-300 text-sm font-semibold">Problems</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-gray-300 text-sm font-semibold">Tests</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-gray-300 text-sm font-semibold">Success</span>
                    </div>
                  </div>
                </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-800">                    {filteredLeaderboard.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="mb-4">
                          <Users className="text-gray-600 text-4xl mx-auto w-16 h-16" />
                        </div>
                        <p className="text-gray-400 text-lg mb-2">No users found</p>
                        {searchTerm && (
                          <p className="text-gray-500 text-sm">
                            Try adjusting your search term or clearing the search
                          </p>
                        )}
                      </div>
                    ) : (
                      filteredLeaderboard.map((userData, index) => (
                        <div
                          key={userData._id}
                          className={`px-6 py-4 hover:bg-gray-800/50 transition-all duration-200 ${
                            isAuthenticated && userData._id === user?.id 
                              ? 'bg-green-500/10 border-l-4 border-green-500' 
                              : ''
                          }`}
                        >
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Rank */}
                            <div className="col-span-1 text-center">
                              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getRankBadge(userData.rank)}`}>
                                {userData.rank <= 3 ? (
                                  getRankIcon(userData.rank)
                                ) : (
                                  <span className="text-sm font-bold">#{userData.rank}</span>
                                )}
                              </div>
                            </div>

                            {/* User Info */}
                            <div className="col-span-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
                                  {userData?.avatar ? (
                                    <img 
                                      src={userData.avatar} 
                                      alt={userData?.username || 'User'}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm font-bold text-white">
                                      {userData?.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                  )}
                                </div>
                                <div>                                  <p className="font-semibold text-white flex items-center gap-2">
                                    {userData?.username || 'Unknown User'}
                                    {userData.rank === 1 && <Crown className="text-yellow-500 w-4 h-4" />}
                                    {isAuthenticated && userData._id === user?.id && (
                                      <Badge className="bg-green-600 text-white text-xs">You</Badge>
                                    )}
                                  </p>
                                  <p className="text-gray-400 text-sm">Level {userData?.level || 1}</p>
                                </div>
                              </div>
                            </div>

                            {/* Points */}
                            <div className="col-span-2 text-center">
                              <p className="font-bold text-yellow-500 text-lg">{formatNumber(userData?.totalPoints || userData?.score || 0)}</p>
                              <p className="text-gray-400 text-xs">{formatNumber(userData?.experience || 0)} XP</p>
                            </div>

                            {/* Problems */}
                            <div className="col-span-2 text-center">
                              <p className="font-bold text-green-500">{userData.totalProblemsSolved || 0}</p>
                              <div className="flex items-center justify-center gap-1 mt-1">
                                {userData.easyProblemsSolved && (
                                  <span className="text-xs text-green-400">{userData.easyProblemsSolved}E</span>
                                )}
                                {userData.mediumProblemsSolved && (
                                  <span className="text-xs text-yellow-400">{userData.mediumProblemsSolved}M</span>
                                )}
                                {userData.hardProblemsSolved && (
                                  <span className="text-xs text-red-400">{userData.hardProblemsSolved}H</span>
                                )}
                              </div>
                            </div>

                            {/* Tests */}
                            <div className="col-span-2 text-center">
                              <p className="font-bold text-blue-500">{userData.totalTests || 0}</p>
                              {userData.averageTestScore && (
                                <p className="text-gray-400 text-xs">Avg: {userData.averageTestScore}%</p>
                              )}
                            </div>

                            {/* Success Rate */}
                            <div className="col-span-1 text-center">
                              <p className={`font-bold ${getSuccessRateColor(userData.successRate || 0)}`}>
                                {userData.successRate || 0}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="bg-gray-900/30 px-6 py-4 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} users
                        </div>
                        
                        <div className="flex items-center gap-2">                          <Button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            variant="secondary"
                            size="sm"
                            className="disabled:opacity-50"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          
                          <Badge className="bg-green-600 text-white px-3 py-1">
                            {currentPage}
                          </Badge>
                          
                          <span className="text-gray-400 text-sm">of {pagination.pages}</span>
                            <Button
                            onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                            disabled={currentPage === pagination.pages}
                            variant="secondary"
                            size="sm"
                            className="disabled:opacity-50"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>                  )}
                </Card>
              </>
            )}
          </div>
        </section>{/* Nearby Users Section */}
      {isAuthenticated && userPosition && userPosition.nearbyUsers && (
        <section className="relative py-12 bg-gray-900/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-8">
              <Badge className="bg-blue-500/10 text-blue-500 mb-4">Your Neighborhood</Badge>              <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Eye className="w-6 h-6" />
                Users Near Your Rank
              </h3>
              <p className="text-gray-400">See how you compare with users at similar skill levels</p>
            </div>            
            <Card className="bg-black/80 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden max-w-4xl mx-auto">
              <div className="divide-y divide-gray-800">
                {userPosition.nearbyUsers.map((userData) => (
                  <div
                    key={userData._id}
                    className={`px-6 py-4 transition-all duration-200 ${
                      userData.isCurrentUser 
                        ? 'bg-green-500/10 border-l-4 border-green-500' 
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadge(userData.rank)}`}>
                          #{userData.rank}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {userData?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-white">
                            {userData?.username || 'Unknown User'}
                            {userData.isCurrentUser && (
                              <Badge className="bg-green-600 text-white text-xs ml-2">You</Badge>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <span className="text-yellow-500 font-semibold">{formatNumber(userData?.totalPoints || 0)}</span>
                          <p className="text-gray-400 text-xs">points</p>
                        </div>
                        <div className="text-center">
                          <span className="text-green-500 font-semibold">{userData?.totalProblemsSolved || 0}</span>
                          <p className="text-gray-400 text-xs">problems</p>
                        </div>
                        <div className="text-center">
                          <span className="text-blue-500 font-semibold">{userData?.totalTests || 0}</span>
                          <p className="text-gray-400 text-xs">tests</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
};

export default LeaderBoard;