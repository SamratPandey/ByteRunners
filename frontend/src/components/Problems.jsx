import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Check, Star, ArrowUpDown } from 'lucide-react';
import axios from 'axios';
import { debounce } from 'lodash';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    totalProblems: 0,
    easyTotal: 0,
    mediumTotal: 0,
    hardTotal: 0
  });
  const navigate = useNavigate();
  const limit = 10;

  // Fetch problems with all params
  const fetchProblems = async (pageNum, shouldAppend = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      const response = await axios.get(`${import.meta.env.BACKEND_URL}/problems`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: pageNum,
          limit,
          search: searchQuery,
          difficulty: difficulty !== 'all' ? difficulty : undefined,
          category: category !== 'all' ? category : undefined,
          sortBy
        },
      });

      const { problems: newProblems, stats: newStats } = response.data;
      setHasMore(newProblems.length === limit);
      setStats(newStats);
      
      if (shouldAppend) {
        setProblems(prev => [...prev, ...newProblems]);
      } else {
        setProblems(newProblems);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(() => {
      setPage(1);
      fetchProblems(1, false);
    }, 500),
    [searchQuery, difficulty, category, sortBy]
  );

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchQuery, difficulty, category, sortBy]);

  const handleScroll = useCallback((event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
      setPage(prev => prev + 1);
      fetchProblems(page + 1, true);
    }
  }, [loading, hasMore, page]);

  const getDifficultyColor = (difficulty) => ({
    Easy: 'bg-green-500',
    Medium: 'bg-yellow-500',
    Hard: 'bg-red-500'
  }[difficulty]);

  const categories = [
    { id: 'all', name: 'All Problems' },
    { id: 'arrays', name: 'Arrays & Strings' },
    { id: 'linkedlist', name: 'Linked Lists' },
    { id: 'trees', name: 'Trees & Graphs' },
    { id: 'dp', name: 'Dynamic Programming' }
  ];

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'acceptance', label: 'Acceptance Rate' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'newest', label: 'Newest' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Stats Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white mb-4">Problem Set</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
              <div className="text-2xl font-bold mb-2">{stats.totalSolved}/{stats.totalProblems}</div>
              <Progress value={(stats.totalSolved / stats.totalProblems) * 100} />
            </CardContent>
          </Card>
          {['Easy', 'Medium', 'Hard'].map((diff) => (
            <Card key={diff}>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">{diff}</div>
                <div className="text-2xl font-bold mb-2">
                  {stats[`${diff.toLowerCase()}Solved`]}/{stats[`${diff.toLowerCase()}Total`]}
                </div>
                <Progress 
                  value={(stats[`${diff.toLowerCase()}Solved`] / stats[`${diff.toLowerCase()}Total`]) * 100}
                  className={getDifficultyColor(diff)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Input
          placeholder="Search problems..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-64"
        />
        
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categories Tabs */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setCategory}>
        <TabsList className="w-full overflow-x-auto">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="min-w-fit">
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Problems List */}
      <div 
        className="space-y-4 overflow-auto max-h-[calc(100vh-480px)]" 
        onScroll={handleScroll}
      >
        {problems.map((problem) => (
          <Card 
            key={problem._id}
            className="cursor-pointer hover:shadow-lg transition-shadow border-l-4"
            style={{
              borderLeftColor: problem.solved ? '#22c55e' : 'transparent'
            }}
            onClick={() => navigate(`/problems/${problem._id}`)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold dark:text-white">
                      {problem.title}
                    </h3>
                    {problem.solved && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {problem.premium && (
                      <Star className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge className={`${getDifficultyColor(problem.difficulty)} text-white`}>
                      {problem.difficulty}
                    </Badge>
                    {problem.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Acceptance: {problem.acceptanceRate}%
                  </div>
                  {problem.companies && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {problem.companies.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {loading && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {!loading && problems.length === 0 && (
          <div className="text-center p-8">
            <p className="text-gray-500 dark:text-gray-400">No problems found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;