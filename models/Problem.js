const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  inputFormat: { type: String, required: true },
  outputFormat: { type: String, required: true },
  examples: { type: [Object], required: true }, // [{ input: String, output: String }]
  tags: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
