import { create } from 'zustand';

export const useDashboardStore = create((set, get) => ({
  // Общий прогресс
  overallProgress: 45,
  
  // Прогресс по секциям
  currentProgress: {
    ielts: 75,
    tolc: 0,
    universities: 40,
    universitaly: 20,
    codice: 10,
    dov: 5,
    visa: 0
  },

  // Активная секция
  activeSection: 'main',

  // Данные пользователя
  userData: {
    name: 'Аскар Студент',
    level: 'Продвинутый',
    ieltsCurrent: 5.5,
    ieltsTarget: 7.0,
  // Локальный статус сертификата IELTS (UI-уровень)
  // { number?: string, score?: number, date?: string, fileName?: string }
  ieltsCertificate: null,
    tolcCurrent: 0,
    tolcTarget: 0
  },

  // Выбранные университеты
  selectedUniversities: new Set(),
  favoriteUniversities: new Set([1, 3]),

  // AI сообщения
  aiMessages: [
    {
      id: 1,
      type: 'ai',
      message: 'Привет! Я помогу тебе с подготовкой к поступлению. Что тебя интересует?',
      timestamp: new Date()
    }
  ],

  // Дедлайны
  deadlines: [
    { title: 'IELTS тест', days: 45, priority: 'high', color: 'red' },
    { title: 'Подача документов', days: 60, priority: 'medium', color: 'yellow' },
    { title: 'TOLC тест', days: 30, priority: 'high', color: 'red' },
    { title: 'Виза', days: 90, priority: 'low', color: 'green' }    
  ],

  // Действия
  setActiveSection: (section) => set({ activeSection: section }),
  
  updateProgress: (section, progress) => set((state) => ({
    currentProgress: {
      ...state.currentProgress,
      [section]: progress
    }
  })),

  updateOverallProgress: (progress) => set({ overallProgress: progress }),

  addAIMessage: (message) => set((state) => ({
    aiMessages: [...state.aiMessages, {
      id: Date.now(),
      type: 'user',
      message,
      timestamp: new Date()
    }]
  })),

  addAIResponse: (response) => set((state) => ({
    aiMessages: [...state.aiMessages, {
      id: Date.now() + 1,
      type: 'ai',
      message: response,
      timestamp: new Date()
    }]
  })),

  toggleFavoriteUniversity: (id) => set((state) => {
    const newFavorites = new Set(state.favoriteUniversities);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    return { favoriteUniversities: newFavorites };
  }),

  toggleSelectedUniversity: (id) => set((state) => {
    const newSelected = new Set(state.selectedUniversities);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    return { selectedUniversities: newSelected };
  }),

  updateUserData: (data) => set((state) => ({
    userData: { ...state.userData, ...data }
  })),

  // Управление сертификатом IELTS (UI-хранилище)
  setIELTSCertificate: (cert) => set((state) => ({
    userData: { ...state.userData, ieltsCertificate: cert }
  })),
  removeIELTSCertificate: () => set((state) => ({
    userData: { ...state.userData, ieltsCertificate: null }
  }))
}));
