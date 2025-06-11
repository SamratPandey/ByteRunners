import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance with cookie-based auth (same as adminApi.js)
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to handle authentication errors
adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to admin login if not authenticated
      const isLoginPage = window.location.pathname.includes('/admin/login');
      if (!isLoginPage) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Course Management APIs
export const courseApi = {
  // Get all courses
  getAll: (params = {}) => adminApi.get('/api/admin/courses', { params }),
  
  // Get single course
  getById: (id) => adminApi.get(`/api/admin/courses/${id}`),
  
  // Create course
  create: (data) => adminApi.post('/api/admin/courses', data),
  
  // Update course
  update: (id, data) => adminApi.put(`/api/admin/courses/${id}`, data),
  
  // Delete course
  delete: (id) => adminApi.delete(`/api/admin/courses/${id}`),
  
  // Update curriculum
  updateCurriculum: (id, curriculum) => 
    adminApi.put(`/api/admin/courses/${id}/curriculum`, { curriculum }),
  
  // Coupon management
  addCoupon: (id, couponData) => 
    adminApi.post(`/api/admin/courses/${id}/coupons`, couponData),
  
  updateCoupon: (courseId, couponId, data) => 
    adminApi.put(`/api/admin/courses/${courseId}/coupons/${couponId}`, data),
  
  deleteCoupon: (courseId, couponId) => 
    adminApi.delete(`/api/admin/courses/${courseId}/coupons/${couponId}`),
  
  // Analytics
  getAnalytics: (id) => adminApi.get(`/api/admin/courses/${id}/analytics`)
};

// Order Management APIs
export const orderApi = {
  // Get all orders
  getAll: (params = {}) => adminApi.get('/api/admin/orders', { params }),
  
  // Get single order
  getById: (id) => adminApi.get(`/api/admin/orders/${id}`),
  
  // Update order status
  updateStatus: (id, data) => adminApi.put(`/api/admin/orders/${id}/status`, data),
  
  // Process refund
  processRefund: (id, data) => adminApi.post(`/api/admin/orders/${id}/refund`, data),
  
  // Get analytics
  getAnalytics: (params = {}) => adminApi.get('/api/admin/orders/analytics/data', { params }),
  
  // Export orders
  exportCSV: (params = {}) => adminApi.get('/api/admin/orders/export/csv', { params })
};

// Unified Admin Course API (combining course and order APIs for easier import)
export const adminCourseApi = {
  // Course APIs
  getCourses: (params = {}) => courseApi.getAll(params),
  getCourse: (id) => courseApi.getById(id),
  createCourse: (data) => courseApi.create(data),
  updateCourse: (id, data) => courseApi.update(id, data),
  deleteCourse: (id) => courseApi.delete(id),
  updateCurriculum: (id, curriculum) => courseApi.updateCurriculum(id, curriculum),
  
  // Course Analytics
  getCourseAnalytics: (id, timeRange = '30d') => 
    adminApi.get(`/api/admin/courses/${id}/analytics`, { params: { timeRange } }),
  
  exportCourseReport: (id, timeRange = '30d') => 
    adminApi.get(`/api/admin/courses/${id}/export`, { 
      params: { timeRange },
      responseType: 'blob'
    }),
  
  // Coupon APIs
  addCoupon: (id, couponData) => courseApi.addCoupon(id, couponData),
  updateCoupon: (courseId, couponId, data) => courseApi.updateCoupon(courseId, couponId, data),
  deleteCoupon: (courseId, couponId) => courseApi.deleteCoupon(courseId, couponId),
  
  // Order APIs
  getOrders: (params = {}) => orderApi.getAll(params),
  getOrder: (id) => orderApi.getById(id),
  updateOrderStatus: (id, data) => orderApi.updateStatus(id, data),
  processRefund: (refundData) => adminApi.post(`/api/admin/orders/${refundData.orderId}/refund`, refundData),
  
  // Order Analytics
  getOrderAnalytics: (params = {}) => orderApi.getAnalytics(params),
  exportOrderReport: (params = {}) => adminApi.get('/api/admin/orders/export', { 
    params,
    responseType: 'blob'
  }),
  exportOrdersCSV: (params = {}) => orderApi.exportCSV(params)
};

// Generic admin API wrapper
export const adminApiWrapper = {
  get: (url, config) => adminApi.get(url, config),
  post: (url, data, config) => adminApi.post(url, data, config),
  put: (url, data, config) => adminApi.put(url, data, config),
  delete: (url, config) => adminApi.delete(url, config)
};

export default adminApi;
