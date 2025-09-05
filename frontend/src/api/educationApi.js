// API клиент для работы с бекендом образования
import { refreshToken, isTokenExpired } from './tokenUtils';

const API_BASE_URL = 'http://localhost:8000/api/education';

class EducationAPI {
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

    console.log('EducationAPI request:', url, 'token:', !!token);

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

      console.log('EducationAPI response:', response.status, response.statusText);

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

  // Университеты
  async getUniversities(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/universities/${queryString ? '?' + queryString : ''}`);
  }

  async getUniversity(id) {
    return this.request(`/universities/${id}/`);
  }

  // Специальности
  async getMajors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/majors/${queryString ? '?' + queryString : ''}`);
  }

  async getMajor(id) {
    return this.request(`/majors/${id}/`);
  }

  // Курсы
  async getCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/courses/${queryString ? '?' + queryString : ''}`);
  }

  async getCourse(id) {
    return this.request(`/courses/${id}/`);
  }

  // Записи на курсы
  async getEnrollments() {
    return this.request('/enrollments/');
  }

  async createEnrollment(data) {
    return this.request('/enrollments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEnrollment(id, data) {
    return this.request(`/enrollments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEnrollment(id) {
    return this.request(`/enrollments/${id}/`, {
      method: 'DELETE',
    });
  }

  // Заявки
  async getApplications() {
    return this.request('/applications/');
  }

  async createApplication(data) {
    return this.request('/applications/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApplication(id, data) {
    return this.request(`/applications/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteApplication(id) {
    return this.request(`/applications/${id}/`, {
      method: 'DELETE',
    });
  }

  // Достижения
  async getAchievements() {
    return this.request('/achievements/');
  }

  async getUserAchievements() {
    return this.request('/user-achievements/');
  }

  // AI рекомендации
  async getAIRecommendations() {
    return this.request('/ai-recommendations/');
  }

  async generateAIRecommendations() {
    return this.request('/generate-ai-recommendations/', {
      method: 'POST',
    });
  }

  async updateAIRecommendation(id, data) {
    return this.request(`/ai-recommendations/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Уведомления
  async getNotifications() {
    return this.request('/notifications/');
  }

  // Планы обучения
  async getStudyPlans() {
    return this.request('/study-plans/');
  }

  async createStudyPlan(data) {
    return this.request('/study-plans/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudyPlan(id, data) {
    return this.request(`/study-plans/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudyPlan(id) {
    return this.request(`/study-plans/${id}/`, {
      method: 'DELETE',
    });
  }

  // Документы
  async getDocuments() {
    return this.request('/documents/');
  }

  async createDocument(data) {
    return this.request('/documents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDocument(id, data) {
    return this.request(`/documents/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id) {
    return this.request(`/documents/${id}/`, {
      method: 'DELETE',
    });
  }

  // Статистика дашборда
  async getDashboardStats() {
    return this.request('/dashboard/stats/');
  }
}

export default new EducationAPI();
