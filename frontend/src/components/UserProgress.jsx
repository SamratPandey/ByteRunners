import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Trophy, 
  Flame, 
  Target,
  TrendingUp,
  Brain,
  BookOpen,
  Zap,
  ChevronRight,
  Play,
  ArrowRight,
  Star
} from 'lucide-react';

const UserProgress = ({ userProfile }) => {
  const [progress, setProgress] = useState({
    problemsSolved: 12,
    streak: 5,
    totalPoints: 1250,
    completedCourses: 2,
    currentLevel: 3,
    experiencePoints: 180,
    achievements: []
  });

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Load user progress from localStorage or API
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }

    // Generate focused recommendations
    generateRecommendations();
  }, [userProfile]);
  const generateRecommendations = () => {
    if (!userProfile) return;

    const recs = [];
    
    // Generate fewer, more focused recommendations
    if (userProfile.experience === 'beginner') {
      recs.push({
        title: "Master JavaScript Fundamentals",
        description: "Build a solid foundation with our interactive JavaScript course",
        type: "course",
        difficulty: "Easy",
        icon: Code,
        link: "/courses/javascript-basics"
      });
    } else if (userProfile.experience === 'intermediate') {
      recs.push({
        title: "Data Structures Challenge",
        description: "Take your skills to the next level with advanced problems",
        type: "problem",
        difficulty: "Medium",
        icon: Target,
        link: "/problems?category=data-structures"
      });
    }

    // Only show 1-2 recommendations maximum
    setRecommendations(recs.slice(0, 2));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getNextLevelXP = () => {
    return progress.currentLevel * 100;
  };

  const getLevelProgress = () => {
    const nextLevelXP = getNextLevelXP();
    const currentLevelXP = (progress.currentLevel - 1) * 100;
    const progressXP = progress.experiencePoints - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    return (progressXP / neededXP) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Compact Stats Overview */}
      <Card className="bg-black/40 backdrop-blur-sm border border-green-900/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Your Progress</h3>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Level {progress.currentLevel}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{progress.problemsSolved}</div>
            <div className="text-sm text-gray-400">Problems Solved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">{progress.streak}</div>
            <div className="text-sm text-gray-400">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{progress.totalPoints}</div>
            <div className="text-sm text-gray-400">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{progress.completedCourses}</div>
            <div className="text-sm text-gray-400">Courses Done</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Progress to Level {progress.currentLevel + 1}</span>
            <span className="text-sm text-blue-400 font-medium">
              {progress.experiencePoints} / {getNextLevelXP()} XP
            </span>
          </div>
          <Progress 
            value={getLevelProgress()} 
            className="h-2 bg-gray-800"
          />
        </div>
      </Card>

      {/* Quick Actions - Simplified */}
      <Card className="bg-black/40 backdrop-blur-sm border border-green-900/30 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link to="/problems">
            <Button className="w-full h-16 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 flex flex-col items-center justify-center group">
              <Code className="w-5 h-5 text-green-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-green-300">Solve Problems</span>
            </Button>
          </Link>
          
          <Link to="/ai-test">
            <Button className="w-full h-16 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 flex flex-col items-center justify-center group">
              <Brain className="w-5 h-5 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-blue-300">AI Test</span>
            </Button>
          </Link>
          
          <Link to="/courses">
            <Button className="w-full h-16 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 flex flex-col items-center justify-center group">
              <BookOpen className="w-5 h-5 text-yellow-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-yellow-300">Courses</span>
            </Button>
          </Link>
          
          <Link to="/leaderboard">
            <Button className="w-full h-16 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 flex flex-col items-center justify-center group">
              <Trophy className="w-5 h-5 text-orange-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-orange-300">Leaderboard</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Focused Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border border-green-900/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recommended for You</h3>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="group bg-black/20 border border-gray-800/50 rounded-xl p-4 hover:border-green-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <rec.icon className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white text-sm truncate">{rec.title}</h4>
                        <Badge className={`${getDifficultyColor(rec.difficulty)} text-xs px-2 py-0.5`}>
                          {rec.difficulty}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                  <Link to={rec.link}>
                    <Button size="sm" className="bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black transition-all duration-300">
                      <Play className="w-3 h-3 mr-1" />
                      Start
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>      )}
    </div>
  );
};

export default UserProgress;
