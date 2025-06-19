const mongoose = require('mongoose');
const TestResult = require('../models/TestResult');
const TestQuestion = require('../models/TestQuestion');
const User = require('../models/User');

// Test script to verify data flow
async function testDataFlow() {
  try {
    // Connect to MongoDB (use the same connection string as in your app)
    await mongoose.connect('mongodb://localhost:27017/byterunners');
    console.log('Connected to MongoDB');

    // Create a test user if it doesn't exist
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        level: 1,
        experience: 0
      });
      await testUser.save();
      console.log('Created test user');
    }

    // Create sample test questions
    const questions = [
      {
        questionText: 'What is the output of console.log(typeof null)?',
        options: ['null', 'undefined', 'object', 'boolean'],
        correctAnswer: 2,
        explanation: 'In JavaScript, typeof null returns "object" due to a historical bug.',
        subject: 'javascript',
        topic: 'data types',
        difficulty: 'easy',
        aiGenerated: true
      },
      {
        questionText: 'Which of the following is NOT a JavaScript primitive type?',
        options: ['string', 'number', 'array', 'boolean'],
        correctAnswer: 2,
        explanation: 'Array is not a primitive type in JavaScript. It is an object.',
        subject: 'javascript',
        topic: 'data types',
        difficulty: 'easy',
        aiGenerated: true
      }
    ];

    // Save questions and get their IDs
    const savedQuestions = [];
    for (const q of questions) {
      let question = await TestQuestion.findOne({ questionText: q.questionText });
      if (!question) {
        question = new TestQuestion(q);
        await question.save();
      }
      savedQuestions.push(question);
    }
    console.log('Created/found test questions');

    // Create a test result
    const testResult = new TestResult({
      userId: testUser._id,
      subject: 'javascript',
      topic: 'data types',
      difficulty: 'easy',
      questions: [
        {
          questionId: savedQuestions[0]._id,
          questionText: savedQuestions[0].questionText,
          options: savedQuestions[0].options,
          correctAnswer: savedQuestions[0].correctAnswer,
          userAnswer: 2, // Correct answer
          isCorrect: true,
          timeSpent: 30,
          explanation: savedQuestions[0].explanation
        },
        {
          questionId: savedQuestions[1]._id,
          questionText: savedQuestions[1].questionText,
          options: savedQuestions[1].options,
          correctAnswer: savedQuestions[1].correctAnswer,
          userAnswer: 1, // Wrong answer
          isCorrect: false,
          timeSpent: 45,
          explanation: savedQuestions[1].explanation
        }
      ],
      score: 50, // 1 out of 2 correct
      totalQuestions: 2,
      correctAnswers: 1,
      totalTimeSpent: 75,
      analytics: {
        strongAreas: ['basic syntax'],
        weakAreas: ['data types'],
        improvementSuggestions: ['Review JavaScript primitive types'],
        nextRecommendedTopics: ['variables', 'functions']
      },
      aiInsights: {
        overallAssessment: 'Good understanding of basic concepts, but needs work on data types',
        strengths: ['Quick to answer'],
        weaknesses: ['Confused about primitive vs non-primitive types'],
        studyPlan: 'Focus on understanding JavaScript data types and their characteristics',
        estimatedLevel: 'easy'
      }
    });

    await testResult.save();
    console.log('Created test result');

    // Test the analytics endpoint logic
    const allResults = await TestResult.find({ userId: testUser._id });
    console.log(`Found ${allResults.length} test results for user`);

    // Calculate subject performance
    const subjectStats = {};
    allResults.forEach(test => {
      if (!subjectStats[test.subject]) {
        subjectStats[test.subject] = {
          totalTests: 0,
          totalScore: 0,
          bestScore: 0,
          scores: []
        };
      }
      subjectStats[test.subject].totalTests++;
      subjectStats[test.subject].totalScore += test.score;
      subjectStats[test.subject].bestScore = Math.max(subjectStats[test.subject].bestScore, test.score);
      subjectStats[test.subject].scores.push(test.score);
    });

    console.log('Subject Performance:', JSON.stringify(subjectStats, null, 2));

    console.log('✅ Test data flow completed successfully!');

  } catch (error) {
    console.error('❌ Error in test data flow:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testDataFlow();
