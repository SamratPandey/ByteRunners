const mongoose = require('mongoose');

// Define the Activity Schema
const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the Activity model
const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
