const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: {
    type: String,
    enum: ['ai_generated', 'practice', 'assessment', 'skill_test'],
    default: 'ai_generated'
  },
  subject: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'data_structures', 'algorithms', 'system_design', 'databases', 'web_development', 'machine_learning']
  },
  topic: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestQuestion'
    },
    questionText: String,
    options: [String],
    correctAnswer: Number,
    userAnswer: Number,
    isCorrect: Boolean,
    timeSpent: Number, // in seconds
    explanation: String
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  totalTimeSpent: {
    type: Number, // in seconds
    required: true
  },
  averageTimePerQuestion: {
    type: Number // in seconds
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  // Analytics data
  analytics: {
    strongAreas: [String],
    weakAreas: [String],
    improvementSuggestions: [String],
    nextRecommendedTopics: [String]
  },
  // AI-generated insights
  aiInsights: {
    overallAssessment: String,
    strengths: [String],
    weaknesses: [String],
    studyPlan: String,
    estimatedLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
testResultSchema.index({ userId: 1, completedAt: -1 });
testResultSchema.index({ userId: 1, subject: 1, completedAt: -1 });
testResultSchema.index({ userId: 1, difficulty: 1, completedAt: -1 });
testResultSchema.index({ subject: 1, difficulty: 1 });

// Pre-save middleware to calculate derived fields
testResultSchema.pre('save', function(next) {
  if (this.totalTimeSpent && this.totalQuestions) {
    this.averageTimePerQuestion = this.totalTimeSpent / this.totalQuestions;
  }
  next();
});

// Static methods for analytics
testResultSchema.statics.getUserAnalytics = async function(userId, options = {}) {
  const {
    timeRange = 'all', // 'week', 'month', 'all'
    subject = null,
    difficulty = null
  } = options;

  // Build date filter
  let dateFilter = {};
  if (timeRange === 'week') {
    dateFilter = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  } else if (timeRange === 'month') {
    dateFilter = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }

  // Build match criteria
  const matchCriteria = { userId };
  if (Object.keys(dateFilter).length > 0) {
    matchCriteria.completedAt = dateFilter;
  }
  if (subject) matchCriteria.subject = subject;
  if (difficulty) matchCriteria.difficulty = difficulty;

  const analytics = await this.aggregate([
    { $match: matchCriteria },
    {
      $group: {
        _id: null,
        totalTests: { $sum: 1 },
        averageScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        worstScore: { $min: '$score' },
        totalQuestions: { $sum: '$totalQuestions' },
        totalCorrect: { $sum: '$correctAnswers' },
        averageTimePerTest: { $avg: '$totalTimeSpent' },
        recentTests: { $push: '$$ROOT' }
      }
    },
    {
      $project: {
        _id: 0,
        totalTests: 1,
        averageScore: { $round: ['$averageScore', 1] },
        bestScore: 1,
        worstScore: 1,
        overallAccuracy: { 
          $round: [{ $multiply: [{ $divide: ['$totalCorrect', '$totalQuestions'] }, 100] }, 1] 
        },
        averageTimePerTest: { $round: ['$averageTimePerTest', 0] },
        recentTests: { $slice: ['$recentTests', -10] }
      }
    }
  ]);

  return analytics[0] || {
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    worstScore: 0,
    overallAccuracy: 0,
    averageTimePerTest: 0,
    recentTests: []
  };
};

testResultSchema.statics.getSubjectPerformance = async function(userId) {
  return await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$subject',
        totalTests: { $sum: 1 },
        averageScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        lastTestDate: { $max: '$completedAt' }
      }
    },
    {
      $project: {
        subject: '$_id',
        _id: 0,
        totalTests: 1,
        averageScore: { $round: ['$averageScore', 1] },
        bestScore: 1,
        lastTestDate: 1
      }
    },
    { $sort: { averageScore: -1 } }
  ]);
};

testResultSchema.statics.getDifficultyProgress = async function(userId) {
  return await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$difficulty',
        tests: { $sum: 1 },
        averageScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        recentScore: { $last: '$score' }
      }
    },
    {
      $project: {
        difficulty: '$_id',
        _id: 0,
        tests: 1,
        averageScore: { $round: ['$averageScore', 1] },
        bestScore: 1,
        recentScore: 1
      }
    }
  ]);
};

testResultSchema.statics.getTimeBasedAnalytics = async function(userId) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [last7Days, last30Days] = await Promise.all([
    this.aggregate([
      { 
        $match: { 
          userId, 
          completedAt: { $gte: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: null,
          testsLast7Days: { $sum: 1 },
          averageScoreLast7Days: { $avg: '$score' }
        }
      }
    ]),
    this.aggregate([
      { 
        $match: { 
          userId, 
          completedAt: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: null,
          testsLast30Days: { $sum: 1 },
          averageScoreLast30Days: { $avg: '$score' }
        }
      }
    ])
  ]);

  return {
    testsLast7Days: last7Days[0]?.testsLast7Days || 0,
    averageScoreLast7Days: Math.round(last7Days[0]?.averageScoreLast7Days || 0),
    testsLast30Days: last30Days[0]?.testsLast30Days || 0,
    averageScoreLast30Days: Math.round(last30Days[0]?.averageScoreLast30Days || 0)
  };
};

// Instance methods
testResultSchema.methods.generateInsights = function() {
  const insights = {
    performance: this.score >= 80 ? 'Excellent' : this.score >= 60 ? 'Good' : 'Needs Improvement',
    recommendation: '',
    focusAreas: []
  };

  // Analyze wrong answers
  const wrongAnswers = this.questions.filter(q => !q.isCorrect);
  if (wrongAnswers.length > 0) {
    insights.focusAreas = [...new Set(wrongAnswers.map(q => q.topic || this.topic))];
  }

  return insights;
};

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;
