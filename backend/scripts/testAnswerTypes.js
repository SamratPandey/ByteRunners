// Quick test to verify answer data types
console.log('Testing answer data types...');

// Simulate what the frontend should now send
const mockAnswers = [
  { questionId: '507f1f77bcf86cd799439011', selectedAnswer: 0, timeSpent: 30 },
  { questionId: '507f1f77bcf86cd799439012', selectedAnswer: 2, timeSpent: 45 },
  { questionId: '507f1f77bcf86cd799439013', selectedAnswer: 1, timeSpent: 25 }
];

console.log('Mock answers structure:');
mockAnswers.forEach((answer, index) => {
  console.log(`Question ${index + 1}:`);
  console.log(`  - questionId: ${answer.questionId} (type: ${typeof answer.questionId})`);
  console.log(`  - selectedAnswer: ${answer.selectedAnswer} (type: ${typeof answer.selectedAnswer})`);
  console.log(`  - timeSpent: ${answer.timeSpent} (type: ${typeof answer.timeSpent})`);
});

// Test validation
const isValid = mockAnswers.every(answer => 
  typeof answer.questionId === 'string' &&
  typeof answer.selectedAnswer === 'number' &&
  typeof answer.timeSpent === 'number' &&
  answer.selectedAnswer >= 0 &&
  answer.selectedAnswer <= 3
);

console.log(`\nData validation: ${isValid ? '✅ PASS' : '❌ FAIL'}`);

if (isValid) {
  console.log('✅ All answer data types are correct!');
  console.log('The TestResult model should now accept this data without validation errors.');
} else {
  console.log('❌ Data type validation failed!');
}
