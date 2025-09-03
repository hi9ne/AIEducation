import axios from 'axios';

// Auto-detect environment and set API URL
const getApiUrl = () => {
  // Check if we're in development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Check if we're in production (Railway)
  if (window.location.hostname.includes('railway.app')) {
    return 'https://backend-production-0046c.up.railway.app';
  }
  
  // Fallback to environment variable
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

const apiUrl = getApiUrl();
console.log('API URL detected:', apiUrl);

const api = axios.create({
  baseURL: apiUrl
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Если ошибка 401 и это не логин/регистрация/сброс пароля, пробуем refresh
    const isAuthRequest = originalRequest.url.includes('/api/login/') || originalRequest.url.includes('/api/register/') || originalRequest.url.includes('/api/password-reset/');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(getApiUrl() + '/api/token/refresh/', {
          refresh: refreshToken
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/api/login/', credentials),
  register: (userData) => api.post('/api/register/', userData),
  logout: (refresh_token) => api.post('/api/logout/', { refresh: refresh_token }),
  resetPassword: (email) => api.post('/api/password-reset/', { email }),
  verifyReset: (data) => api.post('/api/password-reset/verify/', data),
  getProfile: () => api.get('/api/profile/'),
  updateProfile: (data) => api.patch('/api/profile/update/', data),
  changePassword: (data) => api.post('/api/profile/change-password/', data),
  requestEmailVerify: () => api.post('/api/email/verify/request/'),
};

// Платежи
export const paymentAPI = {
  payWithCard: (paymentData) => api.post('/api/pay/', paymentData),
  getStatus: (paymentId) => api.get(`/api/pay/status/?payment_id=${encodeURIComponent(paymentId)}`),
};

// Default export
export default api;
