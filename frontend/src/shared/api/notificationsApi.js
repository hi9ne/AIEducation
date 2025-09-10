// API клиент для работы с уведомлениями
import { refreshToken, isTokenExpired } from './tokenUtils';

const detectBaseUrl = () => {
  const envUrl = (import.meta.env?.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (envUrl) return `${envUrl}/api/notifications`;

  const host = window.location.hostname;
  if (
    host === 'localhost' || host === '127.0.0.1' ||
    host.startsWith('172.') || host.startsWith('192.168.') || host.startsWith('10.')
  ) {
    return `http://${host}:8000/api/notifications`;
  }
  return 'http://localhost:8000/api/notifications';
};

const API_BASE_URL = detectBaseUrl();

class NotificationsAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Получение токена из localStorage
  getAuthToken() {
    return localStorage.getItem('accessToken');
  }

  // Базовый метод для HTTP запросов с автоматическим обновлением токена
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    let token = this.getAuthToken();

    // Проверяем, не истек ли токен
    if (token && isTokenExpired(token)) {
      try {
        token = await refreshToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // Перенаправляем на страницу входа
        window.location.href = '/login';
        return;
      }
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Пытаемся обновить токен
        try {
          const newToken = await refreshToken();
          // Повторяем запрос с новым токеном
          const newConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          const retryResponse = await fetch(url, newConfig);
          
          if (retryResponse.status === 401) {
            const errorData = await retryResponse.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Учетные данные не были предоставлены.');
          }
          
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${retryResponse.status}`);
          }
          
          return await retryResponse.json();
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          window.location.href = '/login';
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Уведомления
  async getNotifications() {
    return this.request('/');
  }

  async getNotification(id) {
    return this.request(`/${id}/`);
  }

  async markAsRead(id) {
    return this.request(`/${id}/mark-read/`, {
      method: 'POST',
    });
  }

  async markAllAsRead() {
    return this.request('/mark-all-read/', {
      method: 'POST',
    });
  }

  async createNotification(data) {
    return this.request('/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNotification(id, data) {
    return this.request(`/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNotification(id) {
    return this.request(`/${id}/`, {
      method: 'DELETE',
    });
  }

  // Шаблоны уведомлений
  async getNotificationTemplates() {
    return this.request('/templates/');
  }

  async createNotificationTemplate(data) {
    return this.request('/templates/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNotificationTemplate(id, data) {
    return this.request(`/templates/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNotificationTemplate(id) {
    return this.request(`/templates/${id}/`, {
      method: 'DELETE',
    });
  }
}

export default new NotificationsAPI();
