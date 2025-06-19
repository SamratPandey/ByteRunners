const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import User model
const User = require('../models/User');

const migrateDifficultyValues = async () => {
  try {
    console.log('Starting difficulty values migration...');

    // Find all users with testHistory that contains old difficulty values
    const users = await User.find({
      'testHistory.difficulty': { $in: ['beginner', 'intermediate', 'advanced'] }
    });

    console.log(`Found ${users.length} users with old difficulty values`);

    let updatedCount = 0;

    for (const user of users) {
      let hasChanges = false;

      // Update testHistory difficulty values
      if (user.testHistory && user.testHistory.length > 0) {
        user.testHistory.forEach(test => {
          if (test.difficulty === 'beginner') {
            test.difficulty = 'easy';
            hasChanges = true;
          } else if (test.difficulty === 'intermediate') {
            test.difficulty = 'medium';
            hasChanges = true;
          } else if (test.difficulty === 'advanced') {
            test.difficulty = 'hard';
            hasChanges = true;
          }
        });
      }

      // Update analytics.questionGenerationHistory if it exists
      if (user.analytics && user.analytics.questionGenerationHistory && user.analytics.questionGenerationHistory.length > 0) {
        user.analytics.questionGenerationHistory.forEach(question => {
          if (question.difficulty === 'beginner') {
            question.difficulty = 'easy';
            hasChanges = true;
          } else if (question.difficulty === 'intermediate') {
            question.difficulty = 'medium';
            hasChanges = true;
          } else if (question.difficulty === 'advanced') {
            question.difficulty = 'hard';
            hasChanges = true;
          }
        });
      }

      if (hasChanges) {
        // Save user with updated difficulty values
        await user.save();
        updatedCount++;
        console.log(`Updated user: ${user.email} (${user._id})`);
      }
    }

    console.log(`Migration completed! Updated ${updatedCount} users.`);
    
    // Also update any TestQuestion records
    const TestQuestion = require('../models/TestQuestion');
    const questionResult = await TestQuestion.updateMany(
      { difficulty: { $in: ['beginner', 'intermediate', 'advanced'] } },
      [
        {
          $set: {
            difficulty: {
              $switch: {
                branches: [
                  { case: { $eq: ['$difficulty', 'beginner'] }, then: 'easy' },
                  { case: { $eq: ['$difficulty', 'intermediate'] }, then: 'medium' },
                  { case: { $eq: ['$difficulty', 'advanced'] }, then: 'hard' }
                ],
                default: '$difficulty'
              }
            }
          }
        }
      ]
    );

    console.log(`Updated ${questionResult.modifiedCount} test questions.`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateDifficultyValues();
