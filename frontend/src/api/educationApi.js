import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class EducationAPI {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      withCredentials: true,
    });

    this.api.interceptors.request.use(config => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('Учетные данные не были предоставлены.');
            }
            const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
              refresh: refreshToken,
            });
            localStorage.setItem('accessToken', response.data.access);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            console.error('Unable to refresh token:', refreshError);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Не перенаправляем на логин, просто показываем ошибку
            throw new Error('Учетные данные не были предоставлены.');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  login = (username, password) => this.api.post('/auth/login/', { username, password });
  register = (username, email, password) => this.api.post('/auth/register/', { username, email, password });
  logout = () => this.api.post('/auth/logout/');
  
  // Profile
  getProfile = () => this.api.get('/education/profiles/me/');
  updateProfile = (data) => this.api.patch('/education/profiles/me/', data);
  
  // Universities
  getUniversities = (filters = {}) => this.api.get('/education/universities/', { params: filters });
  getUniversityDetails = (id) => this.api.get(`/education/universities/${id}/`);
  
  // Majors
  getMajors = (filters = {}) => this.api.get('/education/majors/', { params: filters });
  
  // Applications
  getApplications = () => this.api.get('/education/applications/');
  createApplication = (data) => this.api.post('/education/applications/', data);
  updateApplication = (id, data) => this.api.patch(`/education/applications/${id}/`, data);
  
  // Documents
  getDocuments = () => this.api.get('/education/documents/');
  uploadDocument = (data) => this.api.post('/education/documents/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  // AI
  getAIRecommendations = () => this.api.get('/education/ai-recommendations/');
  sendAIChatMessage = (message) => this.api.post('/education/ai-chat/', { message });
  
  // Notifications
  getNotifications = () => this.api.get('/education/notifications/');
  markNotificationAsRead = (id) => this.api.patch(`/education/notifications/${id}/`, { read: true });
  
  // Achievements
  getAchievements = () => this.api.get('/education/achievements/');
  
  // Dashboard Stats
  getDashboardStats = () => this.api.get('/education/dashboard/stats/');
  
  // Study Plan
  getStudyPlan = () => this.api.get('/education/study-plans/me/');
  createStudyPlanItem = (data) => this.api.post('/education/study-plan-items/', data);
  updateStudyPlanItem = (id, data) => this.api.patch(`/education/study-plan-items/${id}/`, data);
  deleteStudyPlanItem = (id) => this.api.delete(`/education/study-plan-items/${id}/`);
}

const educationAPI = new EducationAPI();
export default educationAPI;
