const User = require('../models/User');
const aiService = require('../utils/aiService');

// Save onboarding data
const saveOnboardingData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { experienceLevel, interests, languages, skillAssessment } = req.body;    // Validate required fields
    if (!experienceLevel || !interests || !languages || !skillAssessment) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all onboarding steps including experience level, interests, preferred languages, and skill assessment.'
      });
    }

    // Calculate initial level based on skill assessment
    const correctAnswers = skillAssessment.filter(answer => answer.isCorrect).length;
    const assessmentScore = (correctAnswers / skillAssessment.length) * 100;
    
    let initialLevel = 1;
    let initialExperience = 0;
    
    // Determine initial level based on experience and assessment
    if (experienceLevel === 'beginner') {
      initialLevel = assessmentScore >= 80 ? 2 : 1;
      initialExperience = assessmentScore >= 80 ? 150 : 50;
    } else if (experienceLevel === 'intermediate') {
      initialLevel = assessmentScore >= 80 ? 4 : 3;
      initialExperience = assessmentScore >= 80 ? 350 : 250;
    } else if (experienceLevel === 'advanced') {
      initialLevel = assessmentScore >= 80 ? 6 : 5;
      initialExperience = assessmentScore >= 80 ? 550 : 450;
    }

    // Prepare onboarding data
    const onboardingData = {
      experienceLevel,
      interests,
      languages,
      skillAssessment: {
        questions: skillAssessment,
        score: assessmentScore,
        completedAt: new Date()
      },
      completedAt: new Date(),
      isCompleted: true
    };

    // Update user with onboarding data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        onboardingData,
        level: initialLevel,
        experience: initialExperience,
        'analytics.onboardingCompletedAt': new Date()
      },
      { new: true }
    ).select('-password');

    // Generate initial personalized recommendations
    try {
      const initialRecommendations = await aiService.generateRecommendations(
        onboardingData,
        [] // Empty test history for new users
      );

      // Save initial recommendations
      await User.findByIdAndUpdate(userId, {
        $set: {
          'onboardingData.initialRecommendations': initialRecommendations
        }
      });      res.status(200).json({
        success: true,
        message: 'Welcome to ByteRunners! Your personalized coding journey has been set up successfully.',
        data: {
          user: updatedUser,
          initialRecommendations,
          levelInfo: {
            level: initialLevel,
            experience: initialExperience,
            nextLevelAt: (initialLevel * 100) + 100
          }
        }
      });
    } catch (aiError) {
      console.warn('AI recommendations failed during onboarding, continuing without them:', aiError);
        res.status(200).json({
        success: true,
        message: 'Welcome to ByteRunners! Your profile has been created successfully.',
        data: {
          user: updatedUser,
          initialRecommendations: this.createFallbackRecommendations(onboardingData),
          levelInfo: {
            level: initialLevel,
            experience: initialExperience,
            nextLevelAt: (initialLevel * 100) + 100
          }
        }
      });
    }  } catch (error) {
    console.error('Error saving onboarding data:', error);
    res.status(500).json({
      success: false,
      message: 'We encountered an issue setting up your profile. Please try again, and contact support if the problem persists.',
      error: error.message
    });
  }
};

// Get onboarding status
const getOnboardingStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      'onboardingData level experience'
    );    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found. Please log in again or contact support.'
      });
    }

    const isCompleted = user.onboardingData?.isCompleted || false;    res.status(200).json({
      success: true,
      message: 'Your onboarding progress has been retrieved successfully.',
      data: {
        isCompleted,
        onboardingData: user.onboardingData || null,
        currentLevel: user.level || 1,
        currentExperience: user.experience || 0
      }
    });
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve your onboarding status right now. Please refresh the page or try again later.',
      error: error.message
    });
  }
};

// Get skill assessment questions (predefined for onboarding)
const getSkillAssessmentQuestions = async (req, res) => {
  try {
    const { languages } = req.query;

    // Predefined skill assessment questions
    const questionPool = {
      javascript: [
        {
          id: 'js1',
          question: 'What will be the output of: console.log(typeof null)?',
          options: ['null', 'undefined', 'object', 'boolean'],
          correctAnswer: 'object',
          explanation: 'In JavaScript, typeof null returns "object" due to a historical bug that has been preserved for compatibility.'
        },
        {
          id: 'js2',
          question: 'Which method is used to add an element to the end of an array?',
          options: ['push()', 'pop()', 'shift()', 'unshift()'],
          correctAnswer: 'push()',
          explanation: 'push() adds one or more elements to the end of an array and returns the new length.'
        },
        {
          id: 'js3',
          question: 'What is the difference between == and === in JavaScript?',
          options: [
            'No difference',
            '== checks type and value, === checks only value',
            '=== checks type and value, == checks only value',
            '=== checks type and value, == performs type coercion'
          ],
          correctAnswer: '=== checks type and value, == performs type coercion',
          explanation: '=== is strict equality (checks both type and value), while == performs type coercion before comparison.'
        }
      ],
      python: [
        {
          id: 'py1',
          question: 'What is the output of: print(type([]))?',
          options: ['<class \'array\'>', '<class \'list\'>', '<class \'tuple\'>', '<class \'dict\'>'],
          correctAnswer: '<class \'list\'>',
          explanation: 'In Python, [] creates a list object, so type([]) returns <class \'list\'>.'
        },
        {
          id: 'py2',
          question: 'Which keyword is used to define a function in Python?',
          options: ['function', 'def', 'func', 'define'],
          correctAnswer: 'def',
          explanation: 'The "def" keyword is used to define functions in Python.'
        },
        {
          id: 'py3',
          question: 'What does the len() function return for a string?',
          options: ['Number of words', 'Number of characters', 'Number of lines', 'Size in bytes'],
          correctAnswer: 'Number of characters',
          explanation: 'len() returns the number of characters in a string, including spaces and special characters.'
        }
      ],
      java: [
        {
          id: 'java1',
          question: 'Which keyword is used to create a class in Java?',
          options: ['class', 'Class', 'new', 'create'],
          correctAnswer: 'class',
          explanation: 'The "class" keyword is used to define a class in Java.'
        },
        {
          id: 'java2',
          question: 'What is the correct way to declare a variable in Java?',
          options: ['var x = 5;', 'int x = 5;', 'x = 5;', 'declare int x = 5;'],
          correctAnswer: 'int x = 5;',
          explanation: 'In Java, you must specify the data type when declaring a variable: dataType variableName = value;'
        },
        {
          id: 'java3',
          question: 'Which method is the entry point of a Java application?',
          options: ['start()', 'main()', 'begin()', 'run()'],
          correctAnswer: 'main()',
          explanation: 'The main() method is the entry point of every Java application.'
        }
      ]
    };

    let selectedQuestions = [];
    const requestedLanguages = languages ? languages.split(',') : ['javascript'];

    // Select questions based on requested languages
    requestedLanguages.forEach(lang => {
      const langQuestions = questionPool[lang.toLowerCase()];
      if (langQuestions) {
        selectedQuestions = [...selectedQuestions, ...langQuestions];
      }
    });

    // If no questions found for requested languages, use JavaScript as default
    if (selectedQuestions.length === 0) {
      selectedQuestions = questionPool.javascript;
    }

    // Shuffle and limit to 5 questions
    const shuffledQuestions = selectedQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      message: 'Skill assessment questions retrieved successfully',
      data: {
        questions: shuffledQuestions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options
        })),
        totalQuestions: shuffledQuestions.length
      }
    });
  } catch (error) {
    console.error('Error getting skill assessment questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get skill assessment questions',
      error: error.message
    });
  }
};

// Validate skill assessment answers
const validateSkillAssessment = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Valid answers array is required'
      });
    }

    // This is a simplified validation - in practice, you'd store correct answers securely
    const questionPool = {
      js1: 'object',
      js2: 'push()',
      js3: '=== checks type and value, == performs type coercion',
      py1: '<class \'list\'>',
      py2: 'def',
      py3: 'Number of characters',
      java1: 'class',
      java2: 'int x = 5;',
      java3: 'main()'
    };

    const validatedAnswers = answers.map(answer => {
      const correctAnswer = questionPool[answer.questionId];
      const isCorrect = correctAnswer === answer.selectedAnswer;
      
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer,
        isCorrect
      };
    });

    const correctCount = validatedAnswers.filter(a => a.isCorrect).length;
    const score = (correctCount / answers.length) * 100;

    res.status(200).json({
      success: true,
      message: 'Skill assessment validated successfully',
      data: {
        results: validatedAnswers,
        score,
        correctAnswers: correctCount,
        totalQuestions: answers.length
      }
    });
  } catch (error) {
    console.error('Error validating skill assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate skill assessment',
      error: error.message
    });
  }
};

// Create fallback recommendations when AI is not available
const createFallbackRecommendations = (onboardingData) => {
  const { experienceLevel, interests, languages } = onboardingData;

  const recommendations = {
    studyPlan: [],
    nextTopics: [],
    practiceAreas: [],
    difficulty: experienceLevel
  };

  // Basic recommendations based on experience level
  if (experienceLevel === 'beginner') {
    recommendations.studyPlan = [
      'Start with basic syntax and fundamentals',
      'Practice writing simple programs daily',
      'Complete coding exercises and tutorials',
      'Build small projects to apply concepts'
    ];
    recommendations.nextTopics = ['Variables and Data Types', 'Control Structures', 'Functions'];
    recommendations.practiceAreas = ['Basic Syntax', 'Problem Solving', 'Debugging'];
  } else if (experienceLevel === 'intermediate') {
    recommendations.studyPlan = [
      'Focus on advanced language features',
      'Learn design patterns and best practices',
      'Work on medium-complexity projects',
      'Practice algorithm implementation'
    ];
    recommendations.nextTopics = ['Object-Oriented Programming', 'Data Structures', 'Algorithms'];
    recommendations.practiceAreas = ['Code Optimization', 'System Design', 'Testing'];
  } else {
    recommendations.studyPlan = [
      'Master advanced concepts and architectures',
      'Contribute to open-source projects',
      'Learn cutting-edge technologies',
      'Mentor other developers'
    ];
    recommendations.nextTopics = ['System Architecture', 'Performance Optimization', 'Advanced Patterns'];
    recommendations.practiceAreas = ['Architecture Design', 'Code Review', 'Technical Leadership'];
  }

  return recommendations;
};

module.exports = {
  saveOnboardingData,
  getOnboardingStatus,
  getSkillAssessmentQuestions,
  validateSkillAssessment
};
