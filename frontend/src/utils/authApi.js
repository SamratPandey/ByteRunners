import axios from 'axios';
import { toast } from 'react-hot-toast';


const authApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, 
});

// Request interceptor to add common headers
authApi.interceptors.request.use(
  (config) => {
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

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Network error:', error.message);
      
      if (!error.config.url.includes('/check-auth')) {
        toast('Network error. Please check your connection.', { icon: '❌' });
      }    } else if (error.response.status === 401) {
      const isCheckingAuth = error.config.headers['x-checking-auth'] === 'true';
      const isLoginPage = window.location.pathname.includes('/login');
      const message = error.response.data?.message;
      
      if (!isCheckingAuth && !isLoginPage && message === 'Session expired') {
        localStorage.removeItem('auth');
        sessionStorage.removeItem('auth');
        // Show message
        toast('Session expired. Please login again.', { icon: '❌' });
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired'));
      }    } else {
      const message = error.response.data?.message || 'An error occurred';
      // Don't show toast for check-auth or verification endpoints (components handle their own errors)
      const skipToastUrls = ['/check-auth', '/send-verification', '/verify-email', '/resend-verification'];
      const shouldSkipToast = skipToastUrls.some(url => error.config.url.includes(url));
      
      if (!shouldSkipToast) {
        toast(message, { icon: '❌' });
      }
      console.error('API error:', message);
    }
    
    return Promise.reject(error);
  }
);

export default authApi;
