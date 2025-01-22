import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, ArrowUpDown, BookOpen, Star, Clock, Trophy, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import Nav from './Nav';

const Problems = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState({ field: 'id', direction: 'asc' });
  const [selectedProblem, setSelectedProblem] = useState(null);
  const itemsPerPage = 10;

  // Extended mock problems data
  const problems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      acceptance: "54.7%",
      isLocked: false,
      status: "solved",
      category: "Array",
      likes: 15420,
      dislikes: 742,
      submissions: 24680,
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        }
      ],
      companies: ["Amazon", "Google", "Apple"],
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      lastAttempted: "2024-01-20"
    },
    // Add more problems with similar structure
  ];

  // Categories with counts
  const categories = [
    { name: 'Array', count: 1827 },
    { name: 'String', count: 755 },
    { name: 'Hash Table', count: 661 },
    { name: 'Dynamic Programming', count: 561 },
    { name: 'Math', count: 554 },
    { name: 'Sorting', count: 433 },
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'hard':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'solved':
        return <Trophy className="w-4 h-4 text-green-500" />;
      case 'attempted':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleSort = (field) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedProblems = problems
    .filter(problem => {
      const matchesDifficulty = selectedDifficulty === 'All' || problem.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === 'All' || problem.category === selectedCategory;
      const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDifficulty && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const direction = sortBy.direction === 'asc' ? 1 : -1;
      if (typeof a[sortBy.field] === 'string') {
        return direction * a[sortBy.field].localeCompare(b[sortBy.field]);
      }
      return direction * (a[sortBy.field] - b[sortBy.field]);
    });

  const pageCount = Math.ceil(filteredAndSortedProblems.length / itemsPerPage);
  const currentProblems = filteredAndSortedProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />
      <main className="container mx-auto px-4 py-8 pt-20">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Problems', value: problems.length, icon: BookOpen },
            { label: 'Solved', value: problems.filter(p => p.status === 'solved').length, icon: Trophy },
            { label: 'Acceptance Rate', value: '67.8%', icon: Star },
            { label: 'Submissions', value: '24.6K', icon: Clock }
          ].map((stat, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-colors">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-green-500 opacity-75" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Section */}
        <div className="space-y-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
            {['All', 'Easy', 'Medium', 'Hard'].map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`
                  ${selectedDifficulty === difficulty
                    ? 'bg-green-500 hover:bg-green-600 text-white border-green-500'
                    : 'bg-gray-900/50 text-gray-400 border-gray-700 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/50'
                  } transition-all duration-200
                `}
              >
                {difficulty}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant="ghost"
                onClick={() => setSelectedCategory(category.name)}
                className={`${
                  selectedCategory === category.name
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'text-gray-400 hover:bg-green-500/10 hover:text-green-400'
                } transition-colors`}
              >
                {category.name}
                <Badge className="ml-2 bg-gray-800">{category.count}</Badge>
              </Button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search problems by title, tag, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2 pl-10 
                focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50
                hover:border-gray-700 transition-colors text-gray-300"
            />
          </div>
        </div>

        {/* Problems Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-400">Status</th>
                <th className="px-6 py-3 text-left text-gray-400">
                  <button
                    className="flex items-center gap-2 hover:text-green-400 transition-colors"
                    onClick={() => handleSort('title')}
                  >
                    Title
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-gray-400">
                  <button
                    className="flex items-center gap-2 hover:text-green-400 transition-colors"
                    onClick={() => handleSort('acceptance')}
                  >
                    Acceptance
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-gray-400">Difficulty</th>
                <th className="px-6 py-3 text-left text-gray-400">Category</th>
              </tr>
            </thead>
            <tbody>
              {currentProblems.map((problem) => (
                <tr
                  key={problem.id}
                  onClick={() => setSelectedProblem(problem)}
                  className="border-t border-gray-800/50 hover:bg-green-500/5 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    {getStatusIcon(problem.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white hover:text-green-500">
                        {problem.title}
                      </span>
                      {problem.isLocked && (
                        <Badge className="bg-yellow-500/20 text-yellow-500">Premium</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{problem.acceptance}</td>
                  <td className="px-6 py-4">
                    <span className={getDifficultyColor(problem.difficulty)}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-gray-800 text-gray-300">
                      {problem.category}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProblems.length)} of {filteredAndSortedProblems.length} problems
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-gray-300 hover:bg-green-500/20 hover:border-green-500 disabled:text-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'text-gray-300 hover:bg-green-500/20 hover:border-green-500'
                  }
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
              className="text-gray-300 hover:bg-green-500/20 hover:border-green-500 disabled:text-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Problem Details Modal */}
        {selectedProblem && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto mt-16">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedProblem.title}
                    </h2>
                    <div className="flex items-center gap-4">
                      <Badge className={getDifficultyColor(selectedProblem.difficulty)}>
                        {selectedProblem.difficulty}
                      </Badge>
                      <span className="text-gray-400">
                        Acceptance: {selectedProblem.acceptance}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedProblem(null)}
                    className="text-gray-400 hover:bg-gray-800 hover:text-gray-300 transition-colors"
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-300">{selectedProblem.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Examples</h3>
                    {selectedProblem.examples.map((example, index) => (
                      <div key={index} className="bg-black/50 rounded-lg p-4 mb-4">
                        <p className="text-gray-300">Input: {example.input}</p>
                        <p className="text-gray-300">Output: {example.output}</p>
                        {example.explanation && (
                          <p className="text-gray-400 mt-2">
                            Explanation: {example.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Companies</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProblem.companies.map((company) => (
                        <Badge
                          key={company}
                          className="bg-gray-800 text-gray-300 hover:bg-gray-700"
                        >
                          {company}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Time Complexity</h3>
                      <Badge className="bg-gray-800 text-gray-300">
                        {selectedProblem.timeComplexity}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Space Complexity</h3>
                      <Badge className="bg-gray-800 text-gray-300">
                        {selectedProblem.spaceComplexity}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-8">
                    <Button
                      variant="outline"
                      className="text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      onClick={() => setSelectedProblem(null)}
                    >
                      Close
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white transition-colors"
                    >
                      Solve Problem
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Problems;