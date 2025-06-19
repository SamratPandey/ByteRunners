const aiService = require('../utils/aiService');
const TestQuestion = require('../models/TestQuestion');
const TestResult = require('../models/TestResult');
const User = require('../models/User');

// Generate AI-powered test questions (Enhanced)
const generateTestQuestions = async (req, res) => {
  try {
    const { subject, topic, difficulty, count = 5 } = req.body;
    const userId = req.user?.id;

    if (!subject || !topic || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the subject, topic, and difficulty level to generate your personalized test questions.'
      });
    }

    // Get user context for better personalization
    let userContext = {};
    if (userId) {
      const user = await User.findById(userId).select('name experience level testHistory');
      userContext = {
        name: user?.name || 'User',
        experience: user?.experience || 0,
        level: user?.level || 1,
        previousTests: user?.testHistory?.length || 0
      };
    }    // Map difficulty from frontend to backend enum values for consistency
    const difficultyMap = {
      'beginner': 'easy',
      'intermediate': 'medium', 
      'advanced': 'hard'
    };
    const mappedDifficulty = difficultyMap[difficulty] || difficulty;

    // Generate questions using AI with enhanced context
    const questions = await aiService.generateQuestions(subject, topic, difficulty, count, userContext);

    // Check if questions were generated successfully
    if (!questions || questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Unable to generate test questions at this time. Please try again later or contact support if the problem persists.',
        error: 'No questions generated'
      });
    }

    // Log question generation for analytics
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          'analytics.questionGenerationHistory': {
            subject,
            topic,
            difficulty: mappedDifficulty,
            count: questions.length,
            timestamp: new Date(),
            aiGenerated: true
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Your personalized ${difficulty} level ${subject} test on ${topic} has been generated using AI! 🤖`,
      data: {
        questions,
        metadata: {
          subject,
          topic,
          difficulty,
          count: questions.length,
          generatedAt: new Date(),
          aiPowered: true,
          userContext: userContext.name
        }
      }
    });
  } catch (error) {
    console.error('Error generating test questions:', error);
    res.status(500).json({
      success: false,
      message: 'We\'re having trouble generating your personalized test questions right now. Our AI is working to resolve this!',
      error: error.message
    });
  }
};

// Submit test answers and get AI analysis
const submitTestAnswers = async (req, res) => {
  try {
    const { testId, answers, timeSpent, subject, topic, difficulty } = req.body;
    const userId = req.user.id;

    // Map difficulty from frontend to backend enum values for consistency
    const difficultyMap = {
      'beginner': 'easy',
      'intermediate': 'medium', 
      'advanced': 'hard'
    };
    const mappedDifficulty = difficultyMap[difficulty] || difficulty;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your test answers to get your results and personalized feedback.'
      });
    }

    // Get the test questions to calculate score
    const questions = await TestQuestion.find({
      _id: { $in: answers.map(a => a.questionId) }
    });

    // Calculate score
    let correctAnswers = 0;
    const detailedResults = answers.map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question?.correctAnswer,
        isCorrect,
        explanation: question?.explanation
      };
    });

    const score = (correctAnswers / answers.length) * 100;

    // Prepare test data for AI analysis
    const testData = {
      userId,
      subject,
      topic,
      difficulty: mappedDifficulty, // Use mapped difficulty
      score,
      correctAnswers,
      totalQuestions: answers.length,
      timeSpent,
      detailedResults,
      testDate: new Date()
    };    // Get AI analysis of performance
    const aiAnalysis = await aiService.analyzeTestPerformance(userId, testData);

    // Create detailed questions array for TestResult
    const detailedQuestions = answers.map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
      
      return {
        questionId: answer.questionId,
        questionText: question?.questionText || '',
        options: question?.options || [],
        correctAnswer: question?.correctAnswer || 0,
        userAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || Math.floor(timeSpent / answers.length), // Average if not provided
        explanation: question?.explanation || ''
      };
    });

    // Save comprehensive test result to TestResult model
    const testResult = new TestResult({
      userId,
      subject,
      topic,
      difficulty: mappedDifficulty,
      questions: detailedQuestions,
      score,
      totalQuestions: answers.length,
      correctAnswers,
      totalTimeSpent: timeSpent,
      analytics: {
        strongAreas: aiAnalysis.strengths || [],
        weakAreas: aiAnalysis.weaknesses || [],
        improvementSuggestions: aiAnalysis.improvements || [],
        nextRecommendedTopics: aiAnalysis.recommendations || []
      },
      aiInsights: {
        overallAssessment: aiAnalysis.analysis || '',
        strengths: aiAnalysis.strengths || [],
        weaknesses: aiAnalysis.weaknesses || [],
        studyPlan: aiAnalysis.studyPlan || '',
        estimatedLevel: mappedDifficulty
      }
    });

    await testResult.save();

    // Save test result to user's history (for backward compatibility)
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          testHistory: {
            subject,
            topic,
            difficulty: mappedDifficulty,
            score,
            correctAnswers,
            totalQuestions: answers.length,
            timeSpent,
            aiAnalysis: aiAnalysis.analysis,
            recommendations: aiAnalysis.recommendations,
            timestamp: new Date(),
            testResultId: testResult._id // Reference to detailed result
          }
        },
        $inc: {
          'learningAnalytics.totalTestsTaken': 1,
          'learningAnalytics.timeSpentLearning': Math.round(timeSpent / 60), // Convert to minutes
          experience: Math.floor(score / 10) // 1 XP per 10% score
        },
        $set: {
          'learningAnalytics.lastTestDate': new Date(),
          'learningAnalytics.averageScore': await calculateAverageScore(userId, score)
        }
      },
      { new: true }
    );

    // Update question usage statistics
    await Promise.all(
      answers.map(answer =>
        TestQuestion.findByIdAndUpdate(answer.questionId, {
          $inc: {
            'usageStats.timesUsed': 1,
            [`usageStats.correctAnswers`]: answer.selectedAnswer === questions.find(q => q._id.toString() === answer.questionId)?.correctAnswer ? 1 : 0
          }
        })
      )
    );    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        testResultId: testResult._id,
        score,
        correctAnswers,
        totalQuestions: answers.length,
        percentage: score,
        timeSpent,
        detailedResults: detailedQuestions,
        aiAnalysis: {
          analysis: aiAnalysis.analysis,
          strengths: aiAnalysis.strengths,
          weaknesses: aiAnalysis.weaknesses,
          improvements: aiAnalysis.improvements,
          recommendations: aiAnalysis.recommendations,
          studyPlan: aiAnalysis.studyPlan
        },
        userLevel: user.level,
        experienceGained: Math.floor(score / 10), // 1 XP per 10% score
        totalExperience: user.experience
      }
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit test',
      error: error.message
    });
  }
};

// Get personalized recommendations
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      'onboardingData testHistory learningAnalytics level experience'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate AI-powered recommendations
    const recommendations = await aiService.generateRecommendations(
      user.onboardingData,
      user.testHistory
    );

    res.status(200).json({
      success: true,
      message: 'Recommendations generated successfully',
      data: {
        recommendations,        userProfile: {
          level: user.level,
          experience: user.experience,
          totalTests: user.learningAnalytics?.totalTestsTaken || 0,
          averageScore: user.learningAnalytics?.averageScore || 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
};

// Get test history and analytics
const getTestAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      'testHistory learningAnalytics level experience'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate additional analytics
    const subjectPerformance = calculateSubjectPerformance(user.testHistory);
    const difficultyProgress = calculateDifficultyProgress(user.testHistory);
    const timeBasedAnalytics = calculateTimeBasedAnalytics(user.testHistory);

    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: {
        overview: {          level: user.level,
          experience: user.experience,
          totalTests: user.learningAnalytics?.totalTestsTaken || 0,
          averageScore: user.learningAnalytics?.averageScore || 0,
          timeSpentLearning: user.learningAnalytics?.timeSpentLearning || 0,
          lastTestDate: user.learningAnalytics?.lastTestDate
        },
        testHistory: user.testHistory.slice(-10), // Last 10 tests
        subjectPerformance,
        difficultyProgress,
        timeBasedAnalytics
      }
    });
  } catch (error) {
    console.error('Error getting test analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get test analytics',
      error: error.message
    });
  }
};

// Helper functions
const calculateAverageScore = async (userId, newScore) => {
  const user = await User.findById(userId).select('testHistory learningAnalytics');
  
  // Initialize learningAnalytics if it doesn't exist
  if (!user.learningAnalytics) {
    user.learningAnalytics = {
      totalTestsTaken: 0,
      averageScore: 0,
      strongTopics: [],
      weakTopics: [],
      learningStreak: 0,
      improvementTrend: 0,
      timeSpentLearning: 0
    };
  }
  
  const totalTests = (user.learningAnalytics.totalTestsTaken || 0) + 1;
  const currentTotal = (user.learningAnalytics.averageScore || 0) * (totalTests - 1);
  return (currentTotal + newScore) / totalTests;
};

const calculateSubjectPerformance = (testHistory) => {
  const subjectStats = {};
  
  testHistory.forEach(test => {
    if (!subjectStats[test.subject]) {
      subjectStats[test.subject] = {
        totalTests: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        topics: {}
      };
    }
    
    const stats = subjectStats[test.subject];
    stats.totalTests++;
    stats.totalScore += test.score;
    stats.averageScore = stats.totalScore / stats.totalTests;
    stats.bestScore = Math.max(stats.bestScore, test.score);
    
    // Topic-wise performance
    if (!stats.topics[test.topic]) {
      stats.topics[test.topic] = {
        tests: 0,
        averageScore: 0,
        totalScore: 0
      };
    }
    stats.topics[test.topic].tests++;
    stats.topics[test.topic].totalScore += test.score;
    stats.topics[test.topic].averageScore = stats.topics[test.topic].totalScore / stats.topics[test.topic].tests;
  });
  
  return subjectStats;
};

const calculateDifficultyProgress = (testHistory) => {
  const difficultyStats = {
    easy: { tests: 0, averageScore: 0, totalScore: 0 },
    medium: { tests: 0, averageScore: 0, totalScore: 0 },
    hard: { tests: 0, averageScore: 0, totalScore: 0 }
  };
  
  testHistory.forEach(test => {
    const stats = difficultyStats[test.difficulty];
    if (stats) {
      stats.tests++;
      stats.totalScore += test.score;
      stats.averageScore = stats.totalScore / stats.tests;
    }
  });
  
  return difficultyStats;
};

const calculateTimeBasedAnalytics = (testHistory) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentTests = testHistory.filter(test => new Date(test.timestamp) >= thirtyDaysAgo);
  const weeklyTests = testHistory.filter(test => new Date(test.timestamp) >= sevenDaysAgo);
  
  return {
    testsLast30Days: recentTests.length,
    testsLast7Days: weeklyTests.length,
    averageScoreLast30Days: recentTests.length > 0 
      ? recentTests.reduce((sum, test) => sum + test.score, 0) / recentTests.length 
      : 0,
    averageScoreLast7Days: weeklyTests.length > 0 
      ? weeklyTests.reduce((sum, test) => sum + test.score, 0) / weeklyTests.length 
      : 0
  };
};

// Enhanced analytics endpoint for TestAnalytics component
const getDetailedAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get comprehensive analytics data from TestResult model
    const testResults = await TestResult.find({ userId })
      .sort({ completedAt: -1 })
      .limit(50);

    // Calculate overall statistics
    const totalTests = testResults.length;
    const averageScore = totalTests > 0 ? testResults.reduce((sum, test) => sum + test.score, 0) / totalTests : 0;
    const totalTimeSpent = testResults.reduce((sum, test) => sum + (test.totalTimeSpent || 0), 0);

    // Calculate subject performance
    const subjectStats = {};
    testResults.forEach(test => {
      if (!subjectStats[test.subject]) {
        subjectStats[test.subject] = {
          totalTests: 0,
          totalScore: 0,
          bestScore: 0,
          scores: [],
          totalTime: 0
        };
      }
      subjectStats[test.subject].totalTests++;
      subjectStats[test.subject].totalScore += test.score;
      subjectStats[test.subject].bestScore = Math.max(subjectStats[test.subject].bestScore, test.score);
      subjectStats[test.subject].scores.push(test.score);
      subjectStats[test.subject].totalTime += test.totalTimeSpent || 0;
    });

    const subjectPerformance = Object.entries(subjectStats).reduce((acc, [subject, stats]) => {
      acc[subject] = {
        totalTests: stats.totalTests,
        averageScore: stats.totalScore / stats.totalTests,
        bestScore: stats.bestScore,
        averageTime: stats.totalTime / stats.totalTests,
        improvement: stats.scores.length > 1 ? 
          ((stats.scores[0] - stats.scores[stats.scores.length - 1]) / stats.scores[stats.scores.length - 1]) * 100 : 0
      };
      return acc;
    }, {});

    // Calculate difficulty progress
    const difficultyStats = {};
    testResults.forEach(test => {
      if (!difficultyStats[test.difficulty]) {
        difficultyStats[test.difficulty] = {
          tests: 0,
          totalScore: 0,
          bestScore: 0,
          scores: []
        };
      }
      difficultyStats[test.difficulty].tests++;
      difficultyStats[test.difficulty].totalScore += test.score;
      difficultyStats[test.difficulty].bestScore = Math.max(difficultyStats[test.difficulty].bestScore, test.score);
      difficultyStats[test.difficulty].scores.push(test.score);
    });

    const difficultyProgress = Object.entries(difficultyStats).reduce((acc, [difficulty, stats]) => {
      acc[difficulty] = {
        tests: stats.tests,
        averageScore: stats.totalScore / stats.tests,
        bestScore: stats.bestScore,
        improvement: stats.scores.length > 1 ? 
          ((stats.scores[0] - stats.scores[stats.scores.length - 1]) / stats.scores[stats.scores.length - 1]) * 100 : 0
      };
      return acc;
    }, {});

    // Get user level and experience from User model
    const user = await User.findById(userId).select('level experience');

    // Format test history with more details
    const formattedHistory = testResults.slice(0, 20).map(test => ({
      id: test._id,
      subject: test.subject,
      topic: test.topic,
      difficulty: test.difficulty,
      score: test.score,
      questions: test.totalQuestions,
      correctAnswers: test.correctAnswers,
      date: test.completedAt.toLocaleDateString(),
      timeSpent: Math.floor((test.totalTimeSpent || 0) / 60), // Convert to minutes
      aiInsights: test.aiInsights?.overallAssessment || null
    }));

    const analyticsData = {
      overview: {
        level: user?.level || 1,
        experience: user?.experience || 0,
        totalTests,
        averageScore: Math.round(averageScore),
        totalTimeSpent: Math.floor(totalTimeSpent / 60), // Convert to minutes
        recentImprovement: totalTests > 1 ? 
          testResults[0].score - testResults[Math.min(4, totalTests - 1)].score : 0
      },
      subjectPerformance,
      difficultyProgress,
      testHistory: formattedHistory,
      insights: {
        strongestSubject: Object.entries(subjectPerformance).reduce((a, b) => 
          subjectPerformance[a[0]]?.averageScore > subjectPerformance[b[0]]?.averageScore ? a : b, ['', { averageScore: 0 }])[0],
        weakestSubject: Object.entries(subjectPerformance).reduce((a, b) => 
          subjectPerformance[a[0]]?.averageScore < subjectPerformance[b[0]]?.averageScore ? a : b, ['', { averageScore: 100 }])[0],
        preferredDifficulty: Object.entries(difficultyProgress).reduce((a, b) => 
          difficultyProgress[a[0]]?.tests > difficultyProgress[b[0]]?.tests ? a : b, ['', { tests: 0 }])[0]
      }
    };

    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: analyticsData
    });
  } catch (error) {    console.error('Error getting detailed analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
};

// Get AI-powered recommendations
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent test results for analysis
    const recentTests = await TestResult.find({ userId })
      .sort({ completedAt: -1 })
      .limit(10)
      .populate('questions.questionId', 'subject topic difficulty');

    // Get subject performance
    const subjectPerformance = await TestResult.getSubjectPerformance(userId);

    // Analyze weak areas
    const weakSubjects = subjectPerformance
      .filter(perf => perf.averageScore < 70)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 3)
      .map(perf => perf.subject);

    // Get topics that need improvement
    const weakTopics = [];
    recentTests.forEach(test => {
      const wrongAnswers = test.questions.filter(q => !q.isCorrect);
      wrongAnswers.forEach(q => {
        if (q.topic && !weakTopics.includes(q.topic)) {
          weakTopics.push(q.topic);
        }
      });
    });

    // Generate recommendations
    const recommendations = {
      recommendedTopics: weakTopics.slice(0, 5),
      skillGaps: weakSubjects.map(subject => `Improve ${subject.replace('_', ' ')} fundamentals`),
      studyResources: [
        "Practice more coding problems in weak areas",
        "Review fundamental concepts",
        "Take practice tests weekly",
        "Focus on understanding rather than memorization"
      ],
      learningPath: generateLearningPath(subjectPerformance, weakSubjects)
    };

    res.status(200).json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to generate recommendations',
      error: error.message
    });
  }
};

// Helper function to generate learning path
const generateLearningPath = (subjectPerformance, weakSubjects) => {
  if (weakSubjects.length === 0) {
    return "Great job! Continue practicing advanced topics to maintain your strong performance.";
  }

  const primaryWeakness = weakSubjects[0];
  const pathMap = {
    'javascript': 'Start with JavaScript basics, then move to ES6+ features, DOM manipulation, and async programming.',
    'python': 'Focus on Python syntax, data structures, then advance to object-oriented programming and libraries.',
    'java': 'Master Java fundamentals, OOP concepts, then explore frameworks and advanced features.',
    'data_structures': 'Begin with arrays and linked lists, progress to trees, graphs, and advanced structures.',
    'algorithms': 'Start with sorting and searching, then move to dynamic programming and graph algorithms.',
    'web_development': 'Learn HTML/CSS fundamentals, then JavaScript, and finally frameworks like React.',
    'databases': 'Understand SQL basics, database design, then advance to NoSQL and optimization.',
    'system_design': 'Start with basic system components, scalability concepts, then complex architectures.'
  };

  return pathMap[primaryWeakness] || `Focus on improving ${primaryWeakness.replace('_', ' ')} through consistent practice and study.`;
};

// Get user test history
const getUserTestHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, subject, difficulty } = req.query;

    const filter = { userId };
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;

    const testHistory = await TestResult.find(filter)
      .sort({ completedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('subject topic difficulty score totalQuestions correctAnswers completedAt totalTimeSpent');

    const total = await TestResult.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        tests: testHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting test history:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load test history',
      error: error.message
    });
  }
};

module.exports = {
  generateTestQuestions,
  submitTestAnswers,
  getPersonalizedRecommendations,
  getTestAnalytics,
  getDetailedAnalytics,
  getUserTestHistory,
  getRecommendations
};
