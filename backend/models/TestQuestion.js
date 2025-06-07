const mongoose = require('mongoose');

const testQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    required: true
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
    enum: ['easy', 'medium', 'hard']
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'code_analysis', 'conceptual'],
    default: 'multiple_choice'
  },
  tags: [String],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiModel: String, // Which AI model generated this question
  usageCount: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  timesCorrect: {
    type: Number,
    default: 0
  },
  timesIncorrect: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
testQuestionSchema.index({ subject: 1, difficulty: 1 });
testQuestionSchema.index({ topic: 1, difficulty: 1 });
testQuestionSchema.index({ aiGenerated: 1, isActive: 1 });

module.exports = mongoose.model('TestQuestion', testQuestionSchema);
