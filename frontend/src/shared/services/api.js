// DEBUG: Updated at 2025-09-07T07:46:52.964Z
// This should show the correct URL: /api/auth/profile/
import axios from 'axios';

// Resolve API base URL
const getApiUrl = () => {
  // 1) If env is provided at build time, always use it (safest for prod)
  const envUrl = (import.meta.env?.VITE_API_URL || '').trim();
  if (envUrl) return envUrl;

  // 2) Local dev fallback: match current LAN/localhost and port 8000
  const host = window.location.hostname || '';
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('172.') ||
    host.startsWith('192.168.') ||
    host.startsWith('10.')
  ) {
    return `http://${host}:8000`;
  }

  // 3) Final fallback
  return 'http://localhost:8000';
};

const apiUrl = getApiUrl();
export const API_BASE_URL = apiUrl; // <-- export base URL for building absolute media links
console.log('API URL detected:', apiUrl);

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000, // 10 секунд timeout
  headers: {
    'Content-Type': 'application/json',
  },
  transformRequest: [(data, headers) => {
    // Don't transform FormData
    if (data instanceof FormData) {
      return data;
    }
    // Transform JSON data
    if (headers['Content-Type'] === 'application/json') {
      return JSON.stringify(data);
    }
    return data;
  }],
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
    // Server responded with an error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        // If the error data contains validation errors, return the data directly
        // so we can handle field-specific errors in the UI
        if (data.detail || data.error) {
          return data.detail || data.error;
        }
        if (typeof data === 'object' && Object.keys(data).length > 0) {
          return data; // Return validation errors directly
        }
        return 'Неверные данные';
        
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
        if (typeof data === 'object' && Object.keys(data).length > 0) {
          return data; // Return error details directly
        }
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
  loginWithGoogle: (idToken) => api.post('/api/auth/login/google/', { id_token: idToken }),
  
  // Профиль
  getProfile: () => {
    console.log('🔍 DEBUG: getProfile called - using /api/auth/profile/');
    return api.get('/api/auth/profile/');
  },
  updateProfile: (data) => api.patch('/api/auth/profile/update/', data),
  updateProfileComplete: (data) => {
    // Detect files; if present, use multipart; otherwise send JSON
    const values = Object.values(data || {});
    const hasFile = values.some((v) => v instanceof File || v instanceof Blob);

    if (!hasFile) {
      // Send as JSON for simple scalar updates (e.g., dates, strings, numbers)
      return api.patch('/api/auth/profile/update-complete/', data, {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
        return;
      }
      if (value instanceof Date) {
        formData.append(key, value.toISOString().slice(0, 10));
        return;
      }
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
        return;
      }
      formData.append(key, value);
    });

    return api.patch('/api/auth/profile/update-complete/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Пароли
  changePassword: (data) => api.post('/api/auth/change-password/', data),
  resetPassword: (email) => api.post('/api/auth/request-password-reset/', { email }),
  verifyReset: (data) => api.post('/api/auth/confirm-password-reset/', data),
  
  // Email верификация
  requestEmailVerify: () => api.post('/api/auth/email/verify/request/'),
  verifyEmail: (token) => api.post('/api/auth/verify-email/', { token }),

  // Сессии/устройства
  listDevices: () => api.get('/api/auth/devices/'),
  revokeDevice: (deviceId) => api.post(`/api/auth/devices/${deviceId}/revoke/`),
  revokeAllDevices: () => api.post('/api/auth/devices/revoke-all/'),

  // 2FA
  twofaSetup: (force = false) => api.post('/api/auth/2fa/setup/', { force }),
  twofaEnable: (code) => api.post('/api/auth/2fa/enable/', { code }),
  twofaDisable: () => api.post('/api/auth/2fa/disable/'),
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
  create: (paymentData) => api.post('/api/payments/create-payment/', paymentData),
};

// Admin API
// Placeholder: admin API отключен до появления эндпоинтов на бэкенде
export const adminAPI = {
  // getStats: () => api.get('/api/admin/stats/'),
};

// Education API
export const educationAPI = {
  // Upload a user document (e.g., IELTS certificate)
  uploadDocument: ({ file, name = 'IELTS Certificate', description = '' }) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('document_type', 'language_certificate');
    formData.append('file', file);
    if (description) formData.append('description', description);
    return api.post('/api/education/documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  listDocuments: () => api.get('/api/education/documents/'),
  deleteDocument: (id) => api.delete(`/api/education/documents/${id}/`),
  getDashboardStats: () => api.get('/api/education/dashboard/stats/'),
  getDeadlines: () => api.get('/api/education/dashboard/deadlines/'),
  // User events (notes)
  listEvents: () => api.get('/api/education/events/'),
  createEvent: (data) => api.post('/api/education/events/', data),
  deleteEvent: (id) => api.delete(`/api/education/events/${id}/`),
};

// Helper functions
export const apiHelpers = {
  handleError: handleApiError,
  
  // Проверка статуса соединения
  checkConnection: async () => {
    try {
      await api.get('/api/auth/profile/', { timeout: 5000 });
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
