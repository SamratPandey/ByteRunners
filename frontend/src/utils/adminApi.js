import axios from 'axios';

// Create a custom instance for admin API calls
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Request interceptor to attach the token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is due to token expiration
    if (error.response && error.response.status === 401 && error.response.data.expired) {
      // Clear the token
      localStorage.removeItem('adminToken');
      
      // Redirect to login page with an expired token flag
      window.location.href = '/admin/login?tokenExpired=true';
    }
    return Promise.reject(error);
  }
);

export default adminApi;
