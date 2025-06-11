// API utilities for leaderboard functionality
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to make API calls (public endpoints don't need authentication)
const makeApiRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
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

// Helper function for authenticated requests
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

// Leaderboard API functions
export const leaderboardApi = {
  // Get global leaderboard
  getGlobalLeaderboard: async (page = 1, limit = 50, timeframe = 'all') => {
    const params = new URLSearchParams({ page, limit, timeframe });
    return makeApiRequest(`${API_BASE_URL}/leaderboard/global?${params}`);
  },

  // Get category-specific leaderboard
  getCategoryLeaderboard: async (category = 'experience', page = 1, limit = 50) => {
    const params = new URLSearchParams({ category, page, limit });
    return makeApiRequest(`${API_BASE_URL}/leaderboard/category?${params}`);
  },

  // Get user's position in leaderboard (requires authentication)
  getUserPosition: async () => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/leaderboard/my-position`);
  },

  // Get leaderboard statistics
  getLeaderboardStats: async () => {
    return makeApiRequest(`${API_BASE_URL}/leaderboard/stats`);
  },
};

export default leaderboardApi;
