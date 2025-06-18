const axios = require('axios');
const TestQuestion = require('../models/TestQuestion');

class AIService {
  constructor() {
    // Using only OpenAI for all AI operations
    this.provider = {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo'
    };  }

  // Generate questions using AI with enhanced context
  async generateQuestions(subject, topic, difficulty, count = 5, userContext = {}) {
    try {
      const prompt = this.createQuestionGenerationPrompt(subject, topic, difficulty, count, userContext);
      
      const response = await this.callAI(prompt, 'question_generation');
      
      const questions = this.parseGeneratedQuestions(response);
        // Save generated questions to database
      const savedQuestions = await this.saveQuestionsToDatabase(questions, subject, topic, difficulty);
      
      return savedQuestions;
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback to predefined questions if AI fails
      return await this.getFallbackQuestions(subject, topic, difficulty, count);
    }
  }

  // Generate personalized onboarding questions using AI
  async generateOnboardingQuestions(userProfile = {}) {
    try {
      const prompt = this.createOnboardingQuestionsPrompt(userProfile);
      
      const response = await this.callAI(prompt, 'onboarding_questions');
      
      const questions = this.parseOnboardingQuestions(response);
      
      return questions;
    } catch (error) {
      console.error('Error generating onboarding questions:', error);
      return this.getFallbackOnboardingQuestions();
    }
  }

  // Analyze user test performance using AI
  async analyzeTestPerformance(userId, testData) {
    try {
      const prompt = this.createAnalysisPrompt(testData);
      
      const analysis = await this.callAI(prompt, 'performance_analysis');
      
      return this.parseAnalysisResponse(analysis);
    } catch (error) {
      console.error('Error analyzing test performance:', error);
      return this.createFallbackAnalysis(testData);
    }
  }

  // Generate personalized recommendations
  async generateRecommendations(userProfile, testHistory) {
    try {
      const prompt = this.createRecommendationPrompt(userProfile, testHistory);
      
      const recommendations = await this.callAI(prompt, 'recommendations');
      
      return this.parseRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.createFallbackRecommendations(userProfile);
    }
  }  // Core AI calling function - using only OpenAI
  async callAI(prompt, type = 'general') {
    // Check if OpenAI API key is configured
    if (!this.provider.apiKey) {
      console.warn('OpenAI API key not configured, using fallback');
      return this.getFallbackResponse(type, prompt);
    }

    try {
      return await this.callOpenAI(prompt);
    } catch (error) {
      console.error('OpenAI API error:', error);
      console.warn('OpenAI call failed, using fallback');
      return this.getFallbackResponse(type, prompt);
    }
  }

  async callOpenAI(prompt) {
    const response = await axios.post(
      `${this.provider.baseURL}/chat/completions`,
      {
        model: this.provider.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert programming instructor and assessment creator. Generate high-quality, accurate programming questions and provide detailed analysis. Always respond in valid JSON format when requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${this.provider.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }  createQuestionGenerationPrompt(subject, topic, difficulty, count, userContext = {}) {
    const { name = 'User', experience = 0, level = 1, previousTests = 0 } = userContext;
    
    let contextualNote = '';
    if (name !== 'User') {
      contextualNote = `\n\nUser Context: This is for ${name} (Level ${level}, ${experience} XP, ${previousTests} previous tests). Tailor the questions appropriately for their experience level.`;
    }
    
    return `Generate ${count} multiple-choice questions about ${topic} in ${subject} programming language with ${difficulty} difficulty level.

For each question, provide:
1. A clear, specific question
2. Four options (A, B, C, D)
3. The correct answer (0-3 index)
4. A detailed explanation of why the answer is correct

Format the response as JSON array:
[
  {
    "question": "What does the following JavaScript code output?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Detailed explanation here",
    "topic": "${topic}"
  }
]

Make sure questions are:
- Technically accurate
- Appropriate for ${difficulty} level
- Focused on practical programming concepts
- Clear and unambiguous
- Engaging and educational${contextualNote}`;
  }

  createAnalysisPrompt(testData) {
    const { questions, score, totalQuestions, timeSpent } = testData;
    
    return `Analyze this programming test performance:

Test Results:
- Score: ${score}/${totalQuestions} (${((score/totalQuestions) * 100).toFixed(1)}%)
- Time Spent: ${Math.round(timeSpent/60)} minutes
- Questions: ${JSON.stringify(questions.map(q => ({
  topic: q.topic,
  correct: q.isCorrect,
  timeSpent: q.timeSpent
})))}

Provide analysis in JSON format:
{
  "strengths": ["List of topics user performed well in"],
  "weaknesses": ["List of topics needing improvement"],
  "recommendations": ["Specific study recommendations"],
  "nextSteps": ["Concrete next steps for improvement"],
  "studyPlan": "Detailed study plan for next 2 weeks",
  "confidenceLevel": 7
}

Base the analysis on:
- Topics where user scored well vs poorly
- Time management patterns
- Common mistake patterns
- Appropriate next difficulty level`;
  }

  createRecommendationPrompt(userProfile, testHistory) {
    return `Create personalized learning recommendations based on:

User Profile:
- Experience: ${userProfile.experience}
- Interests: ${userProfile.interests}
- Goals: ${userProfile.goals}
- Preferred Languages: ${userProfile.preferredLanguages}

Recent Test Performance:
${testHistory.slice(0, 3).map(test => `
- ${test.subject}: ${test.score}/${test.totalQuestions} (${test.percentage}%)
- Weak areas: ${test.aiAnalysis?.weaknesses || 'N/A'}
`).join('')}

Provide JSON response:
{
  "recommendedTopics": ["Array of topics to study next"],
  "studyResources": ["Specific resources or practice areas"],
  "skillGaps": ["Identified gaps in knowledge"],
  "learningPath": "Suggested learning sequence for next month"
}`;
  }

  createOnboardingQuestionsPrompt(userProfile = {}) {
    const { name = 'User', interests = [], experience = 'beginner' } = userProfile;
    
    return `Generate personalized onboarding questions for a new user named ${name} with ${experience} programming experience interested in ${interests.join(', ') || 'general programming'}.

Create 5-7 engaging questions to understand their:
1. Programming background and goals
2. Preferred learning style
3. Time availability for learning
4. Specific technology interests
5. Career aspirations
6. Project experience
7. Challenges they want to overcome

Format the response as JSON array:
[
  {
    "id": "question_1",
    "question": "What programming languages have you worked with before?",
    "type": "multiple_choice",
    "options": ["JavaScript", "Python", "Java", "C++", "None", "Other"],
    "allowMultiple": true,
    "category": "background"
  },
  {
    "id": "question_2", 
    "question": "What's your primary goal for learning programming?",
    "type": "single_choice",
    "options": ["Career change", "Skill improvement", "Personal projects", "Academic requirements"],
    "category": "goals"
  }
]

Make questions personalized, engaging, and relevant to their experience level.`;
  }

  parseGeneratedQuestions(response) {
    try {
      // Clean the response and parse JSON
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }

  parseAnalysisResponse(response) {
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      return this.createFallbackAnalysis();
    }
  }

  parseRecommendations(response) {
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return this.createFallbackRecommendations();
    }
  }

  parseOnboardingQuestions(response) {
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error parsing onboarding questions response:', error);
      return this.getFallbackOnboardingQuestions();
    }
  }

  async saveQuestionsToDatabase(questions, subject, topic, difficulty) {
    const savedQuestions = [];
    
    for (const questionData of questions) {
      try {
        const question = new TestQuestion({
          questionText: questionData.question,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          explanation: questionData.explanation,
          subject: subject.toLowerCase(),
          topic: questionData.topic || topic,
          difficulty: difficulty.toLowerCase(),
          aiGenerated: true,
          aiModel: this.provider.model,
          tags: [subject, topic, difficulty]
        });

        const saved = await question.save();
        savedQuestions.push(saved);
      } catch (error) {
        console.error('Error saving question to database:', error);
      }
    }

    return savedQuestions;
  }

  async getFallbackQuestions(subject, topic, difficulty, count) {
    // Get existing questions from database as fallback
    try {
      const questions = await TestQuestion.find({
        subject: subject.toLowerCase(),
        difficulty: difficulty.toLowerCase(),
        isActive: true
      }).limit(count);

      return questions;
    } catch (error) {
      console.error('Error getting fallback questions:', error);
      return [];
    }
  }

  getFallbackResponse(type, prompt) {
    switch (type) {
      case 'question_generation':
        return JSON.stringify({
          questions: [
            {
              question: "What is a variable in programming?",
              options: ["A container for storing data", "A function", "A loop", "A condition"],
              correctAnswer: "A container for storing data",
              explanation: "A variable is a named container that stores data values that can be changed during program execution."
            },
            {
              question: "Which of the following is a programming language?",
              options: ["HTML", "CSS", "JavaScript", "XML"],
              correctAnswer: "JavaScript",
              explanation: "JavaScript is a programming language, while HTML and CSS are markup and styling languages respectively."
            }
          ]
        });      case 'performance_analysis':
        return JSON.stringify({
          analysis: "Our AI analysis service is currently offline, but here's some helpful feedback based on your performance!",
          recommendations: [
            "Keep practicing regularly to build consistency",
            "Review the questions you found challenging", 
            "Take breaks between study sessions for better retention"
          ],
          strengths: ["You're taking initiative by testing your skills"],
          improvements: ["Focus on understanding concepts deeply", "Practice time management during tests"]
        });      case 'recommendations':
        return JSON.stringify({
          recommendedTopics: [
            "Programming fundamentals and best practices", 
            "Data structures and their applications", 
            "Algorithm design and analysis"
          ],
          studyResources: [
            "Interactive coding platforms for hands-on practice",
            "Official documentation for deeper understanding", 
            "Community forums for peer learning"
          ],
          skillGaps: ["Complete a skills assessment to identify specific areas for improvement"],
          learningPath: "Start with fundamentals, practice regularly, then tackle advanced concepts step by step"
        });      default:
        return "Our AI services are temporarily unavailable. Please check back soon or contact support if you continue to experience issues.";
    }
  }
  createFallbackAnalysis(testData = {}) {
    const { score = 0, totalQuestions = 5 } = testData;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    return {
      strengths: percentage >= 70 ? [
        'Strong problem-solving approach',
        'Good understanding of core concepts'
      ] : [
        'Willingness to learn and improve',
        'Taking the initiative to test your skills'
      ],
      weaknesses: percentage < 70 ? [
        'Some concepts need reinforcement',
        'Practice will help build confidence'
      ] : [
        'Minor gaps in advanced topics'
      ],
      recommendations: [
        'Continue with regular practice sessions',
        'Review concepts that challenged you most',
        'Try explaining solutions to reinforce understanding',
        'Join coding communities for peer learning'
      ],
      nextSteps: [
        'Take another practice test in a week',
        'Focus on the topics you found most difficult',
        'Set aside 20-30 minutes daily for coding practice',
        'Track your progress over time'
      ],
      studyPlan: 'Build a consistent practice routine: 30 minutes daily with a mix of concepts review and hands-on coding',
      confidenceLevel: Math.max(1, Math.min(10, Math.round(percentage / 10)))
    };
  }
  createFallbackRecommendations(userProfile = {}) {
    return {
      recommendedTopics: [
        'Programming fundamentals and syntax',
        'Problem-solving strategies and patterns',
        'Code optimization and best practices'
      ],
      studyResources: [
        'Interactive tutorials for hands-on learning',
        'Code challenges to practice problem-solving',
        'Documentation reading for deeper understanding',
        'Peer programming sessions for collaborative learning'
      ],
      skillGaps: [
        'Complete a comprehensive skills assessment to identify specific areas for improvement',
        'Regular practice will help identify knowledge gaps naturally'
      ],
      learningPath: 'Start with solid fundamentals, practice consistently with real projects, then gradually tackle more complex challenges'
    };
  }
}

module.exports = new AIService();
