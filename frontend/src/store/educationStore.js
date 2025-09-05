import { create } from 'zustand';
import educationAPI from '../api/educationApi';

const useEducationStore = create((set, get) => ({
  // Состояние
  studentProfile: null,
  universities: [],
  majors: [],
  applications: [],
  documents: [],
  studentDocuments: [],
  progressSteps: [],
  aiRecommendations: [],
  notifications: [],
  achievements: [],
  studyPlans: [],
  dashboardStats: null,
  
  // Загрузка
  loading: {
    studentProfile: false,
    universities: false,
    majors: false,
    applications: false,
    documents: false,
    studentDocuments: false,
    progressSteps: false,
    aiRecommendations: false,
    notifications: false,
    achievements: false,
    studyPlans: false,
    dashboardStats: false,
  },
  
  // Ошибки
  errors: {
    studentProfile: null,
    universities: null,
    majors: null,
    applications: null,
    documents: null,
    studentDocuments: null,
    progressSteps: null,
    aiRecommendations: null,
    notifications: null,
    achievements: null,
    studyPlans: null,
    dashboardStats: null,
  },

  // Действия для профиля студента
  async fetchStudentProfile() {
    set(state => ({ loading: { ...state.loading, studentProfile: true } }));
    try {
      const profiles = await educationAPI.getStudentProfile();
      const profile = profiles.length > 0 ? profiles[0] : null;
      set({ studentProfile: profile });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, studentProfile: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, studentProfile: false } }));
    }
  },

  async createStudentProfile(profileData) {
    set(state => ({ loading: { ...state.loading, studentProfile: true } }));
    try {
      const profile = await educationAPI.createStudentProfile(profileData);
      set({ studentProfile: profile });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, studentProfile: error.message } 
      }));
      throw error;
    } finally {
      set(state => ({ loading: { ...state.loading, studentProfile: false } }));
    }
  },

  async updateStudentProfile(profileId, profileData) {
    set(state => ({ loading: { ...state.loading, studentProfile: true } }));
    try {
      const profile = await educationAPI.updateStudentProfile(profileId, profileData);
      set({ studentProfile: profile });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, studentProfile: error.message } 
      }));
      throw error;
    } finally {
      set(state => ({ loading: { ...state.loading, studentProfile: false } }));
    }
  },

  // Действия для университетов
  async fetchUniversities(params = {}) {
    set(state => ({ loading: { ...state.loading, universities: true } }));
    try {
      const universities = await educationAPI.getUniversities(params);
      set({ universities });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, universities: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, universities: false } }));
    }
  },

  async searchUniversities(searchParams) {
    set(state => ({ loading: { ...state.loading, universities: true } }));
    try {
      const result = await educationAPI.searchUniversities(searchParams);
      set({ universities: result.results || result });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, universities: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, universities: false } }));
    }
  },

  // Действия для направлений
  async fetchMajors(params = {}) {
    set(state => ({ loading: { ...state.loading, majors: true } }));
    try {
      const majors = await educationAPI.getMajors(params);
      set({ majors });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, majors: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, majors: false } }));
    }
  },

  // Действия для заявок
  async fetchApplications() {
    set(state => ({ loading: { ...state.loading, applications: true } }));
    try {
      const applications = await educationAPI.getApplications();
      set({ applications });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, applications: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, applications: false } }));
    }
  },

  async createApplication(applicationData) {
    set(state => ({ loading: { ...state.loading, applications: true } }));
    try {
      const application = await educationAPI.createApplication(applicationData);
      set(state => ({ 
        applications: [...state.applications, application] 
      }));
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, applications: error.message } 
      }));
      throw error;
    } finally {
      set(state => ({ loading: { ...state.loading, applications: false } }));
    }
  },

  // Действия для документов
  async fetchDocuments() {
    set(state => ({ loading: { ...state.loading, documents: true } }));
    try {
      const documents = await educationAPI.getDocuments();
      set({ documents });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, documents: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, documents: false } }));
    }
  },

  async fetchStudentDocuments() {
    set(state => ({ loading: { ...state.loading, studentDocuments: true } }));
    try {
      const documents = await educationAPI.getStudentDocuments();
      set({ studentDocuments: documents });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, studentDocuments: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, studentDocuments: false } }));
    }
  },

  async uploadDocument(documentData) {
    set(state => ({ loading: { ...state.loading, studentDocuments: true } }));
    try {
      const document = await educationAPI.uploadDocument(documentData);
      set(state => ({ 
        studentDocuments: [...state.studentDocuments, document] 
      }));
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, studentDocuments: error.message } 
      }));
      throw error;
    } finally {
      set(state => ({ loading: { ...state.loading, studentDocuments: false } }));
    }
  },

  // Действия для прогресса
  async fetchProgressSteps() {
    set(state => ({ loading: { ...state.loading, progressSteps: true } }));
    try {
      const steps = await educationAPI.getProgressSteps();
      set({ progressSteps: steps });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, progressSteps: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, progressSteps: false } }));
    }
  },

  async updateProgressStep(stepName) {
    try {
      await educationAPI.updateProgressStep(stepName);
      // Обновляем локальное состояние
      set(state => ({
        progressSteps: state.progressSteps.map(step =>
          step.step_name === stepName
            ? { ...step, status: 'completed', completed_at: new Date().toISOString() }
            : step
        )
      }));
    } catch (error) {
      console.error('Failed to update progress step:', error);
      throw error;
    }
  },

  // Действия для AI рекомендаций
  async fetchAIRecommendations() {
    set(state => ({ loading: { ...state.loading, aiRecommendations: true } }));
    try {
      const recommendations = await educationAPI.getAIRecommendations();
      set({ aiRecommendations: recommendations });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, aiRecommendations: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, aiRecommendations: false } }));
    }
  },

  async generateAIRecommendation(recommendationData) {
    try {
      const recommendation = await educationAPI.generateAIRecommendation(recommendationData);
      set(state => ({ 
        aiRecommendations: [...state.aiRecommendations, recommendation] 
      }));
    } catch (error) {
      console.error('Failed to generate AI recommendation:', error);
      throw error;
    }
  },

  // Действия для уведомлений
  async fetchNotifications() {
    set(state => ({ loading: { ...state.loading, notifications: true } }));
    try {
      const notifications = await educationAPI.getNotifications();
      set({ notifications });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, notifications: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, notifications: false } }));
    }
  },

  async markNotificationRead(notificationId) {
    try {
      await educationAPI.markNotificationRead(notificationId);
      set(state => ({
        notifications: state.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  // Действия для достижений
  async fetchAchievements() {
    set(state => ({ loading: { ...state.loading, achievements: true } }));
    try {
      const achievements = await educationAPI.getAchievements();
      set({ achievements });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, achievements: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, achievements: false } }));
    }
  },

  // Действия для планов обучения
  async fetchStudyPlans() {
    set(state => ({ loading: { ...state.loading, studyPlans: true } }));
    try {
      const studyPlans = await educationAPI.getStudyPlans();
      set({ studyPlans });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, studyPlans: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, studyPlans: false } }));
    }
  },

  async createStudyPlan(studyPlanData) {
    set(state => ({ loading: { ...state.loading, studyPlans: true } }));
    try {
      const studyPlan = await educationAPI.createStudyPlan(studyPlanData);
      set(state => ({ 
        studyPlans: [...state.studyPlans, studyPlan] 
      }));
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, studyPlans: error.message } 
      }));
      throw error;
    } finally {
      set(state => ({ loading: { ...state.loading, studyPlans: false } }));
    }
  },

  // Действия для дашборда
  async fetchDashboardStats() {
    set(state => ({ loading: { ...state.loading, dashboardStats: true } }));
    try {
      const stats = await educationAPI.getDashboardStats();
      set({ dashboardStats: stats });
    } catch (error) {
      set(state => ({ 
        errors: { ...state.errors, dashboardStats: error.message } 
      }));
    } finally {
      set(state => ({ loading: { ...state.loading, dashboardStats: false } }));
    }
  },

  // Очистка ошибок
  clearError(section) {
    set(state => ({
      errors: { ...state.errors, [section]: null }
    }));
  },

  // Сброс состояния
  reset() {
    set({
      studentProfile: null,
      universities: [],
      majors: [],
      applications: [],
      documents: [],
      studentDocuments: [],
      progressSteps: [],
      aiRecommendations: [],
      notifications: [],
      achievements: [],
      studyPlans: [],
      dashboardStats: null,
      loading: {
        studentProfile: false,
        universities: false,
        majors: false,
        applications: false,
        documents: false,
        studentDocuments: false,
        progressSteps: false,
        aiRecommendations: false,
        notifications: false,
        achievements: false,
        studyPlans: false,
        dashboardStats: false,
      },
      errors: {
        studentProfile: null,
        universities: null,
        majors: null,
        applications: null,
        documents: null,
        studentDocuments: null,
        progressSteps: null,
        aiRecommendations: null,
        notifications: null,
        achievements: null,
        studyPlans: null,
        dashboardStats: null,
      },
    });
  },
}));

export default useEducationStore;
