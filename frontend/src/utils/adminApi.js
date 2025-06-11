import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create a custom instance for admin API calls
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // This is important for sending/receiving cookies
});

// Request interceptor to add common headers
adminApi.interceptors.request.use(
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
adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (!error.response) {
      // Don't show toast for auth check failures
      if (!error.config.url.includes('/check-auth')) {
        console.error('Admin API request failed:', error.message);
      }
    } else if (error.response.status === 401) {
      // Check if this is an auth check request (has special header)
      const isCheckingAuth = error.config.headers['x-checking-auth'] === 'true';
      // Also check if we're already on the admin login page
      const isLoginPage = window.location.pathname.includes('/admin/login');
      if (!isCheckingAuth && !isLoginPage) {
        window.location.href = '/admin/login';
      }
    } else if (error.response.status === 403) {
      // Forbidden - not enough permissions
      console.error('Permission error:', error.response.data?.message);
    } else {
      // Other errors
      const message = error.response.data?.message || 'An error occurred';
      console.error('API error:', message);
    }
    
    return Promise.reject(error);
  }
);

export default adminApi;
