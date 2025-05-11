const mongoose = require('mongoose');


const problemSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    unique: true
  },
  description: { 
    type: String, 
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  inputFormat: { type: String, required: true },
  outputFormat: { type: String, required: true },
  constraints: { type: String, required: true },
  timeLimit: { type: Number, default: 1000 },
  memoryLimit: { type: Number, default: 256 },
  examples: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: String
  }],
  testCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    isHidden: { type: Boolean, default: true }
  }],
  solutions: [{
    language: String,
    code: String,
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    isOfficial: { type: Boolean, default: true }
  }], 
  starterTemplates: { 
    type: Map, 
    of: String, 
    default: {}
  },
  tags: [{ type: String }],
  categories: [{ type: String }],
  totalSubmissions: { type: Number, default: 0 },
  acceptedSubmissions: { type: Number, default: 0 },
  acceptanceRate: { type: Number, default: 0 },
  premium: { type: Boolean, default: false },
  companies: [{ type: String }],
  similarProblems: [{
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    relationship: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, {
  timestamps: true
});

problemSchema.pre('save', function(next) {
  if (this.totalSubmissions > 0) {
    this.acceptanceRate = (this.acceptedSubmissions / this.totalSubmissions) * 100;
  }
  next();
});

problemSchema.index({ difficulty: 1, status: 1 });
problemSchema.index({ tags: 1 });

module.exports = mongoose.model('Problem', problemSchema);
