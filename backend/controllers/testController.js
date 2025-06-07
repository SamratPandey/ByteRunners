const aiService = require('../utils/aiService');
const TestQuestion = require('../models/TestQuestion');
const User = require('../models/User');

// Generate AI-powered test questions
const generateTestQuestions = async (req, res) => {
  try {
    const { subject, topic, difficulty, count = 5 } = req.body;
    const userId = req.user?.id;    if (!subject || !topic || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the subject, topic, and difficulty level to generate your personalized test questions.'
      });
    }

    // Generate questions using AI
    const questions = await aiService.generateQuestions(subject, topic, difficulty, count);

    // Log question generation for analytics
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          'analytics.questionGenerationHistory': {
            subject,
            topic,
            difficulty,
            count: questions.length,
            timestamp: new Date()
          }
        }
      });
    }    res.status(200).json({
      success: true,
      message: 'Your personalized test questions have been generated successfully!',
      data: {
        questions,
        metadata: {
          subject,
          topic,
          difficulty,
          count: questions.length
        }
      }
    });
  } catch (error) {
    console.error('Error generating test questions:', error);
    res.status(500).json({
      success: false,
      message: 'We\'re having trouble generating your test questions right now. Please try again in a few moments.',
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

module.exports = {
  generateTestQuestions,
  submitTestAnswers,
  getPersonalizedRecommendations,
  getTestAnalytics
};
