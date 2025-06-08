import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyticsCardSkeleton } from '@/components/ui/skeleton';
import { testApi } from '../utils/testApi';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faTrophy, 
  faBrain, 
  faCalendar,
  faBookOpen,
  faBullseye,
  faLightbulb,
  faSpinner,
  faArrowUp,
  faArrowDown,
  faMinus
} from '@fortawesome/free-solid-svg-icons';

const TestAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
    loadRecommendations();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await testApi.getAnalytics();
      setAnalytics(response.data);    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Unable to load your performance analytics right now. Please refresh the page or try again later.', {
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        },
        duration: 4000
      });
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await testApi.getRecommendations();
      setRecommendations(response.data);    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('We couldn\'t generate your personalized recommendations right now. Your progress data is safe!', {
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        },
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => {
    if (!analytics) return null;

    const { overview, subjectPerformance, difficultyProgress } = analytics;

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Level</p>
                <p className="text-2xl font-bold">{overview.level}</p>
              </div>
              <FontAwesomeIcon icon={faTrophy} className="text-3xl text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Average Score</p>
                <p className="text-2xl font-bold">{Math.round(overview.averageScore || 0)}%</p>
              </div>
              <FontAwesomeIcon icon={faBullseye} className="text-3xl text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Tests Taken</p>
                <p className="text-2xl font-bold">{overview.totalTests}</p>
              </div>
              <FontAwesomeIcon icon={faBookOpen} className="text-3xl text-purple-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Experience</p>
                <p className="text-2xl font-bold">{overview.experience}</p>
              </div>
              <FontAwesomeIcon icon={faChartLine} className="text-3xl text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Subject Performance */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faChartLine} className="text-green-400 mr-2" />
            Subject Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(subjectPerformance).map(([subject, stats]) => (
              <div key={subject} className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold capitalize mb-2">{subject}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tests:</span>
                    <span className="text-white">{stats.totalTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average:</span>
                    <span className="text-white">{Math.round(stats.averageScore)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best:</span>
                    <span className="text-green-400">{Math.round(stats.bestScore)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Difficulty Progress */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faBrain} className="text-purple-400 mr-2" />
            Difficulty Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(difficultyProgress).map(([difficulty, stats]) => (
              <div key={difficulty} className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold capitalize mb-2">{difficulty}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tests:</span>
                    <span className="text-white">{stats.tests}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Average:</span>
                    <span className="text-white">{Math.round(stats.averageScore || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        difficulty === 'beginner' ? 'bg-green-500' :
                        difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, stats.averageScore || 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderTestHistory = () => {
    if (!analytics?.testHistory) return null;

    return (
      <div className="space-y-4">
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faCalendar} className="text-blue-400 mr-2" />
            Recent Test History
          </h3>
          <div className="space-y-3">
            {analytics.testHistory.map((test, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="text-white font-semibold capitalize">
                    {test.subject} - {test.topic}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {test.difficulty} • {new Date(test.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    test.score >= 80 ? 'text-green-400' :
                    test.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {Math.round(test.score)}%
                  </div>
                  <div className="text-gray-400 text-sm">
                    {test.correctAnswers}/{test.totalQuestions}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!recommendations) return null;

    return (
      <div className="space-y-6">
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faLightbulb} className="text-yellow-400 mr-2" />
            AI-Powered Recommendations
          </h3>
          
          {/* Recommended Topics */}
          {recommendations.recommendedTopics && (
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">Recommended Topics</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.recommendedTopics.map((topic, index) => (
                  <span 
                    key={index}
                    className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Study Resources */}
          {recommendations.studyResources && (
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">Study Resources</h4>
              <ul className="space-y-2">
                {recommendations.studyResources.map((resource, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faBookOpen} className="text-blue-400 mr-2" />
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skill Gaps */}
          {recommendations.skillGaps && (
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">Areas to Focus On</h4>
              <ul className="space-y-2">
                {recommendations.skillGaps.map((gap, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faBullseye} className="text-red-400 mr-2" />
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learning Path */}
          {recommendations.learningPath && (
            <div>
              <h4 className="text-white font-semibold mb-3">Recommended Learning Path</h4>
              <p className="text-gray-300">{recommendations.learningPath}</p>
            </div>
          )}
        </Card>

        {/* Performance Trends */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faChartLine} className="text-green-400 mr-2" />
            Performance Trends
          </h3>
          
          {analytics?.timeBasedAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Last 7 Days</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tests:</span>
                    <span className="text-white">{analytics.timeBasedAnalytics.testsLast7Days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Score:</span>
                    <span className="text-white">
                      {Math.round(analytics.timeBasedAnalytics.averageScoreLast7Days || 0)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Last 30 Days</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tests:</span>
                    <span className="text-white">{analytics.timeBasedAnalytics.testsLast30Days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Score:</span>
                    <span className="text-white">
                      {Math.round(analytics.timeBasedAnalytics.averageScoreLast30Days || 0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-800 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded w-96 animate-pulse"></div>
          </div>
          
          {/* Analytics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <AnalyticsCardSkeleton key={index} />
            ))}
          </div>
          
          {/* Charts and Additional Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsCardSkeleton className="h-96" />
            <AnalyticsCardSkeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Test Analytics Dashboard</h1>
          <p className="text-gray-400">Track your progress and get AI-powered insights</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-800">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: faChartLine },
                { id: 'history', label: 'Test History', icon: faCalendar },
                { id: 'recommendations', label: 'AI Recommendations', icon: faLightbulb }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'history' && renderTestHistory()}
        {activeTab === 'recommendations' && renderRecommendations()}
      </div>
    </div>
  );
};

export default TestAnalytics;
