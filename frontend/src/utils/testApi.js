// API utilities for onboarding functionality
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Helper function to make authenticated API calls
const makeAuthenticatedRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// Onboarding API functions
export const onboardingApi = {
  // Get onboarding status
  getStatus: async () => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/api/onboarding/status`);
  },

  // Save onboarding data
  saveOnboardingData: async (onboardingData) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/api/onboarding/save`, {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    });
  },

  // Get skill assessment questions
  getSkillAssessmentQuestions: async (languages) => {
    const languageParam = languages ? `?languages=${languages.join(',')}` : '';
    return makeAuthenticatedRequest(`${API_BASE_URL}/api/onboarding/assessment-questions${languageParam}`);
  },

  // Validate skill assessment answers
  validateSkillAssessment: async (answers) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/api/onboarding/validate-assessment`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};

// Test API functions
export const testApi = {
  // Generate AI-powered test questions
  generateQuestions: async (subject, topic, difficulty, count = 5) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/api/test/generate-questions`, {
      method: 'POST',
      body: JSON.stringify({ subject, topic, difficulty, count }),
    });
  },

  // Submit test answers for AI analysis
  submitAnswers: async (testData) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/api/test/submit-answers`, {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  },

  // Get personalized recommendations (legacy endpoint)
  getRecommendations: async () => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/api/test/recommendations`);
  },

  // Get test analytics and history (legacy endpoint)
  getAnalytics: async () => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/api/test/analytics`);
  },

  // Enhanced analytics endpoints for TestAnalytics component
  getDetailedAnalytics: async () => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/api/test/detailed-analytics`);
  },

  // Get AI-powered recommendations
  getAIRecommendations: async () => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/api/test/ai-recommendations`);
  },

  // Get user test history with pagination and filters
  getTestHistory: async (page = 1, limit = 20, subject, difficulty) => {
    const params = new URLSearchParams({ page, limit });
    if (subject) params.append('subject', subject);
    if (difficulty) params.append('difficulty', difficulty);
    
    return makeAuthenticatedRequest(`${API_BASE_URL}/api/test/test-history?${params}`);
  },
};

export default {
  onboardingApi,
  testApi,
};
