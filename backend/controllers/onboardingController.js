const User = require('../models/User');
const aiService = require('../utils/aiService');

// Save onboarding data
const saveOnboardingData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { experienceLevel, interests, languages, skillAssessment } = req.body;    // Validate required fields with detailed error messages
    if (!experienceLevel) {
      return res.status(400).json({
        success: false,
        message: 'Experience level is required. Please select your coding experience level.'
      });
    }
    
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one interest must be selected. Please choose your coding interests.'
      });
    }
    
    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one programming language must be selected.'
      });
    }
    
    if (!skillAssessment || !Array.isArray(skillAssessment)) {
      return res.status(400).json({
        success: false,
        message: 'Skill assessment data is required. Please complete the skill assessment.'
      });
    }

    // Ensure skillAssessment has at least one question
    if (skillAssessment.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Skill assessment must contain at least one question. Please complete the assessment.'
      });
    }    // Validate experience level against enum values
    const validExperienceLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validExperienceLevels.includes(experienceLevel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid experience level. Must be one of: ${validExperienceLevels.join(', ')}`
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

    // Prepare onboarding data with correct field names for the User model
    const onboardingData = {
      experience: experienceLevel, // Map experienceLevel to experience
      interests,
      preferredLanguages: languages, // Map languages to preferredLanguages
      skillAssessment: {
        answers: skillAssessment, // Map to answers array
        score: assessmentScore,
        totalQuestions: skillAssessment.length,
        correctAnswers: correctAnswers,
        completedAt: new Date()
      },
      completedAt: new Date(),
      isCompleted: true
    };    // Update user with onboarding data
    let updatedUser;
    try {      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          onboardingData,
          level: initialLevel,
          experience: initialExperience
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User account not found. Please log in again.'
        });
      }
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save profile data to database. Please try again.',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

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
        success: true,        message: 'Welcome to ByteRunners! Your personalized coding journey has been set up successfully.',
        data: {
          user: updatedUser,
          initialRecommendations,
          levelInfo: {
            level: initialLevel,
            experience: initialExperience,
            nextLevelAt: (initialLevel * 100) + 100,
            assessmentScore: assessmentScore
          }
        }
      });
    } catch (aiError) {
      console.warn('AI recommendations failed during onboarding, continuing without them:', aiError);        res.status(200).json({
        success: true,        message: 'Welcome to ByteRunners! Your profile has been created successfully.',
        data: {
          user: updatedUser,
          initialRecommendations: createFallbackRecommendations(onboardingData),
          levelInfo: {
            level: initialLevel,
            experience: initialExperience,
            nextLevelAt: (initialLevel * 100) + 100,
            assessmentScore: assessmentScore
          }
        }
      });
    }  } catch (error) {
    console.error('Error saving onboarding data:', error);
    console.error('Request body:', req.body);
    console.error('User ID:', req.user?.id);
    res.status(500).json({
      success: false,
      message: 'We encountered an issue setting up your profile. Please try again, and contact support if the problem persists.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    console.log('=== Skill Assessment Validation ===');
    console.log('User ID:', req.user?.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      console.log('Invalid answers format:', answers);
      return res.status(400).json({
        success: false,
        message: 'Valid answers array is required'
      });
    }

    if (answers.length === 0) {
      console.log('Empty answers array');
      return res.status(400).json({
        success: false,
        message: 'At least one answer is required'
      });
    }

    // Get the complete question pool with correct answers
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
          explanation: 'The main() method is the entry point of any Java application.'
        }
      ]
    };

    // Create a lookup map for all questions
    const questionLookup = {};
    Object.values(questionPool).flat().forEach(q => {
      questionLookup[q.id] = q;
    });

    const validatedAnswers = answers.map(answer => {
      const question = questionLookup[answer.questionId];
      if (!question) {
        console.warn(`Question not found for ID: ${answer.questionId}`);
        return {
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: null,
          isCorrect: false,
          question: 'Unknown question'
        };
      }

      // Handle both string answers and option index answers
      let selectedAnswerText = answer.selectedAnswer;
      if (typeof answer.selectedAnswer === 'number') {
        selectedAnswerText = question.options[answer.selectedAnswer];
      }

      const isCorrect = question.correctAnswer === selectedAnswerText;
      
      return {
        questionId: answer.questionId,
        selectedAnswer: selectedAnswerText,
        correctAnswer: question.correctAnswer,
        isCorrect,
        question: question.question,
        explanation: question.explanation
      };
    });    const correctCount = validatedAnswers.filter(a => a.isCorrect).length;
    const score = answers.length > 0 ? (correctCount / answers.length) * 100 : 0;

    console.log(`Validation complete: ${correctCount}/${answers.length} correct (${score.toFixed(1)}%)`);

    res.status(200).json({
      success: true,
      message: 'Skill assessment validated successfully',
      data: {
        results: validatedAnswers,
        score,
        correctAnswers: correctCount,
        totalQuestions: answers.length
      }
    });} catch (error) {
    console.error('Error validating skill assessment:', error);
    console.error('Request body:', req.body);
    res.status(500).json({
      success: false,
      message: 'Failed to validate skill assessment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// Generate AI-powered onboarding questions
const generateOnboardingQuestions = async (req, res) => {
  try {
    const { userProfile = {} } = req.body;
    
    // Generate personalized questions using AI
    const questions = await aiService.generateOnboardingQuestions(userProfile);
    
    res.status(200).json({
      success: true,
      message: 'Personalized onboarding questions generated successfully!',
      data: {
        questions,
        metadata: {
          generatedAt: new Date(),
          userProfile: userProfile.name || 'Anonymous',
          questionCount: questions.length
        }
      }
    });
  } catch (error) {
    console.error('Error generating onboarding questions:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to generate personalized questions right now. Please try again.',
      error: error.message
    });
  }
};

module.exports = {
  saveOnboardingData,
  getOnboardingStatus,
  getSkillAssessmentQuestions,
  validateSkillAssessment,
  generateOnboardingQuestions
};
