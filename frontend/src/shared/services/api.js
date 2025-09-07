// DEBUG: Updated at 2025-09-07T07:46:52.964Z
// This should show the correct URL: /api/auth/profile/
import axios from 'axios';

// Auto-detect environment and set API URL
const getApiUrl = () => {
  // Check if we're in development (localhost or local network)
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('172.') ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.')) {
    // Use the same hostname as the frontend for backend in development
    return `http://${window.location.hostname}:8000`;
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
  baseURL: apiUrl,
  timeout: 10000, // 10 секунд timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Добавляем timestamp для отладки
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error(`[API Error] ${error.response?.status} ${originalRequest.url}`, error.response?.data);
    
    // Если ошибка 401 и это не auth запрос, пробуем refresh token
    const isAuthRequest = originalRequest.url.includes('/api/auth/') || 
                         originalRequest.url.includes('/api/login/') || 
                         originalRequest.url.includes('/api/register/') || 
                         originalRequest.url.includes('/api/password-reset/');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const response = await api.post('/api/auth/token/refresh/', {
          refresh: refreshToken
        });

        const { access, refresh } = response.data;
        localStorage.setItem('accessToken', access);
        if (refresh) {
          localStorage.setItem('refreshToken', refresh);
        }
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[Token Refresh Error]', refreshError);
        // Очищаем токены и перенаправляем на логин
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Показываем уведомление пользователю
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Utility function for handling errors
const handleApiError = (error) => {
  if (error.response) {
    // Сервер ответил с ошибкой
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.detail || data.error || 'Неверные данные';
      case 401:
        return 'Необходима авторизация';
      case 403:
        return 'Доступ запрещен';
      case 404:
        return 'Ресурс не найден';
      case 429:
        return 'Слишком много запросов. Попробуйте позже';
      case 500:
        return 'Ошибка сервера. Попробуйте позже';
      default:
        return data.detail || data.error || `Ошибка ${status}`;
    }
  } else if (error.request) {
    // Запрос был отправлен, но ответа не получено
    return 'Ошибка соединения. Проверьте интернет';
  } else {
    // Ошибка при настройке запроса
    return error.message || 'Неизвестная ошибка';
  }
};

// Auth API methods
export const authAPI = {
  // Аутентификация
  login: (credentials) => api.post('/api/auth/login/', credentials),
  register: (userData) => api.post('/api/auth/register/', userData),
  logout: () => api.post('/api/auth/logout/'),
  refreshToken: (refreshToken) => api.post('/api/auth/token/refresh/', { refresh: refreshToken }),
  
  // Профиль
  getProfile: () => {
    console.log('🔍 DEBUG: getProfile called - using /api/auth/profile/');
    return api.get('/api/auth/profile/');
  },
  updateProfile: (data) => api.patch('/api/auth/profile/update/', data),
  updateProfileComplete: (data) => api.patch("/api/auth/profile/update-complete/", data),
  
  // Пароли
  changePassword: (data) => api.post('/api/auth/change-password/', data),
  resetPassword: (email) => api.post('/api/auth/password-reset/', { email }),
  verifyReset: (data) => api.post('/api/auth/password-reset/verify/', data),
  
  // Email верификация
  requestEmailVerify: () => api.post('/api/email/verify/request/'),
  verifyEmail: (token) => api.get(`/api/email/verify/?token=${token}`),
};

// User profile API
export const profileAPI = {
  get: () => authAPI.getProfile(),
  update: (data) => authAPI.updateProfile(data),
  changePassword: (data) => authAPI.changePassword(data),
  requestEmailVerification: () => authAPI.requestEmailVerify(),
};

// Payment API  
export const paymentAPI = {
  create: (paymentData) => api.post('/api/payments/create/', paymentData),
  getStatus: (paymentId) => api.get(`/api/payments/status/?payment_id=${encodeURIComponent(paymentId)}`),
  simulate: (paymentId) => api.post('/api/payments/simulate/', { payment_id: paymentId }),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats/'),
};

// Helper functions
export const apiHelpers = {
  handleError: handleApiError,
  
  // Проверка статуса соединения
  checkConnection: async () => {
    try {
      await api.get('/api/profile/', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  },
  
  // Безопасный вызов API с обработкой ошибок
  safeCall: async (apiCall, defaultValue = null) => {
    try {
      const response = await apiCall();
      return { success: true, data: response.data, error: null };
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('[Safe API Call Error]', errorMessage);
      return { success: false, data: defaultValue, error: errorMessage };
    }
  }
};

// Default export
export default api;
