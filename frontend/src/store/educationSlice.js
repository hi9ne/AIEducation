import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import educationApi from '../api/educationApi';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'education/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await educationApi.getDashboardStats();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUniversities = createAsyncThunk(
  'education/fetchUniversities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await educationApi.getUniversities(params);
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourses = createAsyncThunk(
  'education/fetchCourses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await educationApi.getCourses(params);
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAchievements = createAsyncThunk(
  'education/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const data = await educationApi.getAchievements();
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAIRecommendations = createAsyncThunk(
  'education/fetchAIRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const data = await educationApi.getAIRecommendations();
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  universities: [],
  courses: [],
  achievements: [],
  aiRecommendations: [],
  dashboardStats: null,
  loading: {
    universities: false,
    courses: false,
    achievements: false,
    aiRecommendations: false,
    dashboardStats: false,
  },
  error: null,
};

// Slice
const educationSlice = createSlice({
  name: 'education',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      // Add any success clearing logic here
    },
  },
  extraReducers: (builder) => {
    // Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.dashboardStats = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.dashboardStats = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.dashboardStats = false;
        state.error = action.payload;
      });

    // Universities
    builder
      .addCase(fetchUniversities.pending, (state) => {
        state.loading.universities = true;
        state.error = null;
      })
      .addCase(fetchUniversities.fulfilled, (state, action) => {
        state.loading.universities = false;
        state.universities = action.payload;
      })
      .addCase(fetchUniversities.rejected, (state, action) => {
        state.loading.universities = false;
        state.error = action.payload;
      });

    // Courses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading.courses = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading.courses = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading.courses = false;
        state.error = action.payload;
      });

    // Achievements
    builder
      .addCase(fetchAchievements.pending, (state) => {
        state.loading.achievements = true;
        state.error = null;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.loading.achievements = false;
        state.achievements = action.payload;
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.loading.achievements = false;
        state.error = action.payload;
      });

    // AI Recommendations
    builder
      .addCase(fetchAIRecommendations.pending, (state) => {
        state.loading.aiRecommendations = true;
        state.error = null;
      })
      .addCase(fetchAIRecommendations.fulfilled, (state, action) => {
        state.loading.aiRecommendations = false;
        state.aiRecommendations = action.payload;
      })
      .addCase(fetchAIRecommendations.rejected, (state, action) => {
        state.loading.aiRecommendations = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = educationSlice.actions;
export default educationSlice.reducer;
