import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCode, 
  faTrophy, 
  faFire, 
  faBullseye,
  faChartLine,
  faClock,
  faRocket,
  faStar,
  faBrain
} from '@fortawesome/free-solid-svg-icons';

const UserProgress = ({ userProfile }) => {
  const [progress, setProgress] = useState({
    problemsSolved: 0,
    streak: 0,
    totalPoints: 0,
    completedCourses: 0,
    currentLevel: 1,
    experiencePoints: 0,
    achievements: []
  });

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Load user progress from localStorage or API
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }

    // Generate recommendations based on user profile
    generateRecommendations();
  }, [userProfile]);

  const generateRecommendations = () => {
    if (!userProfile) return;

    const recs = [];
    
    // Based on experience level
    if (userProfile.experience === 'beginner') {
      recs.push({
        title: "Start with JavaScript Basics",
        description: "Learn the fundamentals of programming with JavaScript",
        type: "course",
        difficulty: "Easy",
        icon: faCode,
        link: "/courses/javascript-basics"
      });
      recs.push({
        title: "Solve Your First Problem",        description: "Try the 'Two Sum' problem - perfect for beginners",
        type: "problem",
        difficulty: "Easy",
        icon: faBullseye,
        link: "/solve/two-sum"
      });
    } else if (userProfile.experience === 'intermediate') {
      recs.push({
        title: "Data Structures Deep Dive",
        description: "Master arrays, linked lists, and trees",
        type: "course",
        difficulty: "Medium",
        icon: faChartLine,
        link: "/courses/data-structures"
      });
      recs.push({        title: "Binary Tree Problems",
        description: "Challenge yourself with tree traversal problems",
        type: "problem",
        difficulty: "Medium",
        icon: faBullseye,
        link: "/problems?category=trees"
      });
    }

    // Based on interests
    if (userProfile.interests.includes('Web Development')) {
      recs.push({
        title: "React Fundamentals",
        description: "Build modern web applications with React",
        type: "course",
        difficulty: "Medium",
        icon: faRocket,
        link: "/courses/react-fundamentals"
      });
    }

    if (userProfile.interests.includes('Data Science')) {
      recs.push({
        title: "Python for Data Science",
        description: "Learn pandas, numpy, and data visualization",
        type: "course",
        difficulty: "Medium",
        icon: faChartLine,
        link: "/courses/python-data-science"
      });
    }

    setRecommendations(recs);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-500';
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
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-green-900 to-green-700 border-green-600 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white">
          <div className="text-center">
            <FontAwesomeIcon icon={faCode} className="text-3xl mb-2" />
            <div className="text-2xl font-bold">{progress.problemsSolved}</div>
            <div className="text-sm opacity-80">Problems Solved</div>
          </div>
          <div className="text-center">
            <FontAwesomeIcon icon={faFire} className="text-3xl mb-2" />
            <div className="text-2xl font-bold">{progress.streak}</div>
            <div className="text-sm opacity-80">Day Streak</div>
          </div>
          <div className="text-center">
            <FontAwesomeIcon icon={faTrophy} className="text-3xl mb-2" />
            <div className="text-2xl font-bold">{progress.totalPoints}</div>
            <div className="text-sm opacity-80">Total Points</div>
          </div>
          <div className="text-center">
            <FontAwesomeIcon icon={faStar} className="text-3xl mb-2" />
            <div className="text-2xl font-bold">Level {progress.currentLevel}</div>
            <div className="text-sm opacity-80">Current Level</div>
          </div>
        </div>
      </Card>

      {/* Level Progress */}
      <Card className="bg-gray-900/50 border-green-900 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Level Progress</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Level {progress.currentLevel}</span>
            <span>{progress.experiencePoints} / {getNextLevelXP()} XP</span>
          </div>
          <Progress value={getLevelProgress()} className="h-3" />
          <p className="text-sm text-gray-400">
            {getNextLevelXP() - progress.experiencePoints} XP to next level
          </p>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gray-900/50 border-green-900 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recommended For You</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700 p-4 hover:border-green-500 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <FontAwesomeIcon icon={rec.icon} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-white">{rec.title}</h4>
                    <Badge className={getDifficultyColor(rec.difficulty)}>
                      {rec.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{rec.description}</p>
                  <Link to={rec.link}>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Start {rec.type === 'course' ? 'Course' : 'Problem'}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>      {/* Quick Actions */}
      <Card className="bg-gray-900/50 border-green-900 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link to="/problems">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <FontAwesomeIcon icon={faCode} className="mr-2" />
              Solve Problems
            </Button>
          </Link>
          <Link to="/ai-test">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <FontAwesomeIcon icon={faBrain} className="mr-2" />
              AI Test
            </Button>
          </Link>
          <Link to="/test-analytics">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <FontAwesomeIcon icon={faChartLine} className="mr-2" />
              Analytics
            </Button>
          </Link>
          <Link to="/courses">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <FontAwesomeIcon icon={faRocket} className="mr-2" />
              Browse Courses
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
              <FontAwesomeIcon icon={faTrophy} className="mr-2" />
              Leaderboard
            </Button>
          </Link>
          <Link to="/profile">
            <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
              <FontAwesomeIcon icon={faStar} className="mr-2" />
              View Profile
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Achievements */}
      {progress.achievements && progress.achievements.length > 0 && (
        <Card className="bg-gray-900/50 border-green-900 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Achievements</h3>
          <div className="space-y-2">
            {progress.achievements.slice(0, 3).map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
                <div>
                  <div className="font-semibold text-white">{achievement.title}</div>
                  <div className="text-sm text-gray-400">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserProgress;
