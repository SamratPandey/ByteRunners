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
    }

    // Generate questions using AI with enhanced context
    const questions = await aiService.generateQuestions(subject, topic, difficulty, count, userContext);

    // Log question generation for analytics
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          'analytics.questionGenerationHistory': {
            subject,
            topic,
            difficulty,
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
    const userId = req.user.id;    if (!answers || !Array.isArray(answers)) {
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
      difficulty,
      score,
      correctAnswers,
      totalQuestions: answers.length,
      timeSpent,
      detailedResults,
      testDate: new Date()
    };

    // Get AI analysis of performance
    const aiAnalysis = await aiService.analyzeTestPerformance(userId, testData);

    // Save test result to user's history
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          testHistory: {
            subject,
            topic,
            difficulty,
            score,
            correctAnswers,
            totalQuestions: answers.length,
            timeSpent,
            aiAnalysis: aiAnalysis.analysis,
            recommendations: aiAnalysis.recommendations,
            timestamp: new Date()
          }
        },
        $inc: {
          'analytics.totalTests': 1,
          'analytics.totalQuestionsAnswered': answers.length
        },
        $set: {
          'analytics.lastTestDate': new Date(),
          'analytics.averageScore': await calculateAverageScore(userId, score)
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
    );

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        score,
        correctAnswers,
        totalQuestions: answers.length,
        percentage: score,
        timeSpent,
        detailedResults,
        aiAnalysis,
        userLevel: user.level,
        experienceGained: Math.floor(score / 10) // 1 XP per 10% score
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
      'onboardingData testHistory analytics level experience'
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
        recommendations,
        userProfile: {
          level: user.level,
          experience: user.experience,
          totalTests: user.analytics.totalTests,
          averageScore: user.analytics.averageScore
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
      'testHistory analytics level experience'
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
        overview: {
          level: user.level,
          experience: user.experience,
          totalTests: user.analytics.totalTests,
          averageScore: user.analytics.averageScore,
          totalQuestionsAnswered: user.analytics.totalQuestionsAnswered,
          lastTestDate: user.analytics.lastTestDate
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
  const user = await User.findById(userId).select('testHistory analytics');
  const totalTests = user.analytics.totalTests + 1;
  const currentTotal = (user.analytics.averageScore || 0) * (totalTests - 1);
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
    beginner: { tests: 0, averageScore: 0, totalScore: 0 },
    intermediate: { tests: 0, averageScore: 0, totalScore: 0 },
    advanced: { tests: 0, averageScore: 0, totalScore: 0 }
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

    // Get comprehensive analytics data
    const [
      overallStats,
      subjectPerformance,
      difficultyProgress,
      timeBasedAnalytics,
      testHistory
    ] = await Promise.all([
      TestResult.getUserAnalytics(userId),
      TestResult.getSubjectPerformance(userId),
      TestResult.getDifficultyProgress(userId),
      TestResult.getTimeBasedAnalytics(userId),
      TestResult.find({ userId })
        .sort({ completedAt: -1 })
        .limit(20)
        .select('subject topic difficulty score totalQuestions correctAnswers completedAt totalTimeSpent')
    ]);

    // Get user level and experience from User model
    const user = await User.findById(userId).select('level experience');

    // Transform subject performance to object format
    const subjectPerformanceObj = {};
    subjectPerformance.forEach(perf => {
      subjectPerformanceObj[perf.subject] = {
        totalTests: perf.totalTests,
        averageScore: perf.averageScore,
        bestScore: perf.bestScore,
        lastTestDate: perf.lastTestDate
      };
    });

    // Transform difficulty progress to object format
    const difficultyProgressObj = {};
    difficultyProgress.forEach(diff => {
      difficultyProgressObj[diff.difficulty] = {
        tests: diff.tests,
        averageScore: diff.averageScore,
        bestScore: diff.bestScore
      };
    });

    // Format test history
    const formattedHistory = testHistory.map(test => ({
      subject: test.subject,
      topic: test.topic,
      difficulty: test.difficulty,
      score: test.score,
      totalQuestions: test.totalQuestions,
      correctAnswers: test.correctAnswers,
      timestamp: test.completedAt,
      timeSpent: test.totalTimeSpent
    }));

    const analyticsData = {
      overview: {
        level: user?.level || 1,
        experience: user?.experience || 0,
        totalTests: overallStats.totalTests,
        averageScore: overallStats.averageScore,
        bestScore: overallStats.bestScore,
        overallAccuracy: overallStats.overallAccuracy
      },
      subjectPerformance: subjectPerformanceObj,
      difficultyProgress: difficultyProgressObj,
      timeBasedAnalytics,
      testHistory: formattedHistory
    };

    res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error getting detailed analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load analytics data',
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
