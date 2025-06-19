const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Import User model
const User = require('../models/User');

const checkTestHistoryData = async () => {
  try {
    console.log('Checking testHistory data...');

    // Find all users with any testHistory
    const usersWithHistory = await User.find({
      'testHistory.0': { $exists: true }
    }).select('email testHistory').limit(5);

    console.log(`Found ${usersWithHistory.length} users with testHistory`);

    for (const user of usersWithHistory) {
      console.log(`\nUser: ${user.email}`);
      console.log('TestHistory entries:');
      user.testHistory.forEach((test, index) => {
        console.log(`  ${index + 1}. Subject: ${test.subject}, Difficulty: ${test.difficulty}, Score: ${test.score}`);
      });
    }

    // Check for any users with old difficulty values that might have been missed
    const usersWithOldValues = await User.find({
      $or: [
        { 'testHistory.difficulty': 'beginner' },
        { 'testHistory.difficulty': 'intermediate' },
        { 'testHistory.difficulty': 'advanced' }
      ]
    }).select('email testHistory');

    console.log(`\nFound ${usersWithOldValues.length} users with old difficulty values`);

    if (usersWithOldValues.length > 0) {
      console.log('Users with old values:');
      usersWithOldValues.forEach(user => {
        console.log(`- ${user.email}: ${user.testHistory.map(t => t.difficulty).join(', ')}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
};

checkTestHistoryData();
