const aiService = require('../utils/aiService');

// Check AI service status
const checkAIStatus = async (req, res) => {
  try {
    const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
    
    res.status(200).json({
      success: true,
      data: {
        aiEnabled: isOpenAIConfigured,
        provider: 'OpenAI',
        model: 'gpt-3.5-turbo',
        features: {
          questionGeneration: isOpenAIConfigured,
          testAnalysis: isOpenAIConfigured,
          onboardingQuestions: isOpenAIConfigured,
          recommendations: isOpenAIConfigured
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking AI status'
    });
  }
};

// Test AI connection
const testAIConnection = async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'OpenAI API key not configured'
      });
    }

    // Test with a simple prompt
    const testPrompt = 'Return only the JSON: {"test": true, "message": "AI connection successful"}';
    const response = await aiService.callAI(testPrompt, 'test');
    
    res.status(200).json({
      success: true,
      message: 'AI connection test successful',
      data: {
        provider: 'OpenAI',
        responseReceived: true,
        testResponse: response
      }
    });
  } catch (error) {
    console.error('AI connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'AI connection test failed',
      error: error.message
    });
  }
};

module.exports = {
  checkAIStatus,
  testAIConnection
};
