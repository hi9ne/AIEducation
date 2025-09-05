import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationsApi from '../api/notificationsApi';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationsApi.getNotifications();
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNotificationTemplates = createAsyncThunk(
  'notifications/fetchNotificationTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationsApi.getNotificationTemplates();
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const data = await notificationsApi.markAsRead(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notificationData, { rejectWithValue }) => {
    try {
      const data = await notificationsApi.createNotification(notificationData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  notifications: [],
  templates: [],
  unreadCount: 0,
  loading: {
    notifications: false,
    templates: false,
    unreadCount: false,
  },
  error: null,
};

// Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      // Add any success clearing logic here
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading.notifications = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading.notifications = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading.notifications = false;
        state.error = action.payload;
      });

    // Fetch Notification Templates
    builder
      .addCase(fetchNotificationTemplates.pending, (state) => {
        state.loading.templates = true;
        state.error = null;
      })
      .addCase(fetchNotificationTemplates.fulfilled, (state, action) => {
        state.loading.templates = false;
        state.templates = action.payload;
      })
      .addCase(fetchNotificationTemplates.rejected, (state, action) => {
        state.loading.templates = false;
        state.error = action.payload;
      });

    // Mark Notification as Read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload.id);
        if (notification) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // Create Notification
    builder
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
        if (!action.payload.is_read) {
          state.unreadCount += 1;
        }
      });
  },
});

export const { clearError, clearSuccess, incrementUnreadCount, decrementUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
