import axios from 'axios';


// Create a custom instance for user API calls
const authApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, 
});

// Request interceptor to add common headers
authApi.interceptors.request.use(
  (config) => {
    // For auth check requests, add the special header
    if (config.url.includes('/check-auth')) {
      config.headers = {
        ...config.headers,
        'x-checking-auth': 'true'
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and other errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error scenarios
    if (!error.response) {
      // Network error (could be CORS)
      console.error('Network error:', error.message);
      
      // Don't show toast for auth check failures
      if (!error.config.url.includes('/check-auth')) {
        console.error('API request failed:', error.message);
      }
    } else if (error.response.status === 401) {
      // Check if this is an auth check request (has special header)
      const isCheckingAuth = error.config.headers['x-checking-auth'] === 'true';
      // Also check if we're already on the login page
      const isLoginPage = window.location.pathname.includes('/login');
      
      if (!isCheckingAuth && !isLoginPage) {
        // Only redirect if not checking auth and not already on login page
        console.log('Auth error, redirecting to login');
        window.location.href = '/login';
      }
    } else {
      // Other errors
      const message = error.response.data?.message || 'An error occurred';
      console.error('API error:', message);
    }
    
    return Promise.reject(error);
  }
);

export default authApi;
