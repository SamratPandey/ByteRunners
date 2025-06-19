import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyticsCardSkeleton } from '@/components/ui/skeleton';
import { testApi } from '../utils/testApi';
import { toast, Toaster } from 'react-hot-toast';
import Nav from './Nav';
import { 
  BarChart3, 
  Trophy, 
  Brain, 
  Calendar,
  BookOpen,
  Target,
  Lightbulb,
  Loader,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Award,
  Clock,
  Zap
} from 'lucide-react';

// Background Pattern Component (matching project style)
const BackgroundPattern = () => (
  <div className="fixed inset-0 pointer-events-none">
    {/* Animated grid pattern */}
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `
          linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'grid-move 20s linear infinite'
      }}
    />
    
    {/* Floating code symbols */}
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute text-green-500/10 select-none animate-pulse-glow"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 20 + 10}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }}
        >
          {['{', '}', '<', '>', '/', '\\', '(', ')', '[', ']', ';', ':', '=', '+', '-'][Math.floor(Math.random() * 15)]}
        </div>
      ))}
    </div>
    
    {/* Gradient orbs */}
    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse-glow" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
  </div>
);

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
      const response = await testApi.getDetailedAnalytics();
      setAnalytics(response.data);    } catch (error) {
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
      const response = await testApi.getAIRecommendations();
      setRecommendations(response.data);} catch (error) {
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
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-black/30 backdrop-blur-lg border border-blue-900/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm mb-1">Level</p>
                <p className="text-3xl font-bold text-white">{overview.level}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Trophy className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm mb-1">Average Score</p>
                <p className="text-3xl font-bold text-white">{Math.round(overview.averageScore || 0)}%</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-lg border border-purple-900/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm mb-1">Tests Taken</p>
                <p className="text-3xl font-bold text-white">{overview.totalTests}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <BookOpen className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-lg border border-orange-900/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm mb-1">Experience</p>
                <p className="text-3xl font-bold text-white">{overview.experience}</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <BarChart3 className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-green-400" />
            Subject Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(subjectPerformance).map(([subject, stats]) => (
              <div key={subject} className="bg-black/50 p-6 rounded-xl border border-green-900/20">
                <h4 className="text-white font-semibold capitalize mb-4 text-lg">{subject}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tests:</span>
                    <span className="text-white font-medium">{stats.totalTests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average:</span>
                    <span className="text-white font-medium">{Math.round(stats.averageScore)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Best:</span>
                    <span className="text-green-400 font-medium">{Math.round(stats.bestScore)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>        {/* Difficulty Progress */}
        <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            Difficulty Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(difficultyProgress).map(([difficulty, stats]) => (
              <div key={difficulty} className="bg-black/50 p-6 rounded-xl border border-purple-900/20">
                <h4 className="text-white font-semibold capitalize mb-4 text-lg">{difficulty}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tests:</span>
                    <span className="text-white font-medium">{stats.tests || stats.totalTests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average:</span>
                    <span className="text-white font-medium">{Math.round(stats.averageScore || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        difficulty === 'beginner' ? 'bg-green-500' :
                        difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, stats.averageScore || 0)}%` }}
                    />
                  </div>
                </div>
              </div>            ))}
          </div>
        </div>

        {/* Performance Insights */}
        {analytics.insights && (
          <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              Performance Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics.insights.strongestSubject && (
                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="w-6 h-6 text-green-400" />
                    <h4 className="text-green-400 font-semibold">Strongest Subject</h4>
                  </div>
                  <p className="text-white text-lg font-medium capitalize">{analytics.insights.strongestSubject}</p>
                  <p className="text-green-300 text-sm mt-2">
                    {Math.round(subjectPerformance[analytics.insights.strongestSubject]?.averageScore || 0)}% average score
                  </p>
                </div>
              )}
              
              {analytics.insights.weakestSubject && (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-6 h-6 text-red-400" />
                    <h4 className="text-red-400 font-semibold">Focus Area</h4>
                  </div>
                  <p className="text-white text-lg font-medium capitalize">{analytics.insights.weakestSubject}</p>
                  <p className="text-red-300 text-sm mt-2">
                    {Math.round(subjectPerformance[analytics.insights.weakestSubject]?.averageScore || 0)}% average score
                  </p>
                </div>
              )}
              
              {analytics.insights.preferredDifficulty && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="w-6 h-6 text-blue-400" />
                    <h4 className="text-blue-400 font-semibold">Comfort Zone</h4>
                  </div>
                  <p className="text-white text-lg font-medium capitalize">{analytics.insights.preferredDifficulty}</p>
                  <p className="text-blue-300 text-sm mt-2">
                    Most practiced difficulty level
                  </p>
                </div>
              )}
            </div>
            
            {analytics.overview.recentImprovement && (
              <div className="mt-6 p-4 bg-black/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  {analytics.overview.recentImprovement > 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : analytics.overview.recentImprovement < 0 ? (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  ) : (
                    <Minus className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-gray-300">
                    Recent Performance: 
                    <span className={`ml-2 font-semibold ${
                      analytics.overview.recentImprovement > 0 ? 'text-green-400' :
                      analytics.overview.recentImprovement < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {analytics.overview.recentImprovement > 0 ? '+' : ''}
                      {Math.round(analytics.overview.recentImprovement)}% change
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTestHistory = () => {
    if (!analytics?.testHistory) return null;

    return (
      <div className="space-y-6">
        <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-green-400" />
            Test History
          </h3>          <div className="space-y-4">
            {analytics.testHistory.map((test, index) => (
              <div key={test.id || index} className="bg-black/50 p-6 rounded-xl border border-green-900/20 hover:border-green-800/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-semibold text-lg capitalize">{test.subject}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        test.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        test.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {test.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3 capitalize">{test.topic}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {test.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {test.questions} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {test.correctAnswers}/{test.questions} correct
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {test.timeSpent}m
                      </span>
                    </div>
                    {test.aiInsights && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-blue-200 text-sm">{test.aiInsights}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right lg:text-center">
                    <div className={`text-3xl font-bold mb-1 ${
                      test.score >= 80 ? 'text-green-400' : 
                      test.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {test.score}%
                    </div>
                    <div className="flex items-center justify-end lg:justify-center gap-1 text-sm">
                      {test.score >= 80 ? (
                        <Award className="w-4 h-4 text-green-400" />
                      ) : test.score >= 60 ? (
                        <Star className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Target className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-gray-400">                        {test.score >= 80 ? 'Excellent' : test.score >= 60 ? 'Good' : 'Needs Work'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!recommendations) return null;

    return (
      <div className="space-y-6">
        <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            AI-Powered Recommendations
          </h3>
          
          {/* Recommended Topics */}
          {recommendations.recommendedTopics && (
            <div className="mb-8">
              <h4 className="text-white font-semibold mb-4 text-lg">Recommended Topics</h4>
              <div className="flex flex-wrap gap-3">
                {recommendations.recommendedTopics.map((topic, index) => (
                  <span 
                    key={index}
                    className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium border border-green-500/30"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Study Resources */}
          {recommendations.studyResources && (
            <div className="mb-8">
              <h4 className="text-white font-semibold mb-4 text-lg">Study Resources</h4>
              <div className="space-y-3">
                {recommendations.studyResources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-black/50 rounded-lg">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-gray-300">{resource}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gaps */}
          {recommendations.skillGaps && (
            <div className="mb-8">
              <h4 className="text-white font-semibold mb-4 text-lg">Areas to Focus On</h4>
              <div className="space-y-3">
                {recommendations.skillGaps.map((gap, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Target className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{gap.topic}</div>
                      <div className="text-sm text-gray-400">Priority: {gap.priority}</div>
                    </div>
                    <div className="text-red-400 font-medium">{gap.weakness}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {recommendations.nextSteps && (
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Next Steps</h4>
              <div className="space-y-3">
                {recommendations.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-black/50 rounded-lg">
                    <div className="p-2 bg-green-500/20 rounded-lg mt-1">
                      <Zap className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">{step.title}</div>
                      <div className="text-gray-400 text-sm">{step.description}</div>
                      {step.estimatedTime && (
                        <div className="text-green-400 text-xs mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {step.estimatedTime}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>          )}
        </div>
      </div>
    );  };
  
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
    <div className="min-h-screen bg-black text-white">
      <BackgroundPattern />
      
      {/* Fixed Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
        <Nav />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-24">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent">
                Test Analytics Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Track your progress, analyze your performance, and get AI-powered insights to improve your skills
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'history', label: 'Test History', icon: Calendar },
              { key: 'recommendations', label: 'AI Recommendations', icon: Lightbulb }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-green-500 text-black'
                    : 'bg-black/40 backdrop-blur-sm border border-green-900/50 text-gray-300 hover:border-green-500'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'history' && renderTestHistory()}
          {activeTab === 'recommendations' && renderRecommendations()}
        </div>
      </main>

      {/* Enhanced CSS Styles */}
      <style jsx>{`
        @keyframes pulse-glow {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(1); }
        }

        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;        }
      `}</style>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default TestAnalytics;
