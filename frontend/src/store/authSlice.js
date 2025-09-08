import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, apiHelpers } from '../shared/services/api';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Сохраняем токены
    localStorage.setItem('accessToken', response.data.tokens.access);
    localStorage.setItem('refreshToken', response.data.tokens.refresh);
      
  // Сохраняем базовую информацию о пользователе
  const userInfo = response.data.user;
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Игнорируем ошибки при logout, все равно очищаем локальные данные
      console.warn('Logout API error (ignored):', error);
    } finally {
      // Всегда очищаем локальные данные
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
    }
    return null;
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(email);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const verifyReset = createAsyncThunk(
  'auth/verifyReset',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyReset(data);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      
      // Обновляем локальную информацию о пользователе
      const userInfo = {
        ...response.data,
        last_fetched: new Date().toISOString()
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const updateProfileComplete = createAsyncThunk(
  'auth/updateProfileComplete',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfileComplete(profileData);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      // Обновляем полный профиль после изменения
      dispatch(fetchProfile());
      
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const requestEmailVerification = createAsyncThunk(
  'auth/requestEmailVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestEmailVerify();
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmail(token);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Восстановление состояния из localStorage
const getInitialState = () => {
  const hasToken = Boolean(localStorage.getItem('accessToken'));
  const userInfo = localStorage.getItem('userInfo');
  
  return {
    user: userInfo ? JSON.parse(userInfo) : null,
    isAuthenticated: hasToken,
    loading: false,
    error: null,
    success: null,
    
    // Состояния для различных операций
    resetEmailSent: false,
    resetVerified: false,
    emailVerificationSent: false,
    profileUpdating: false,
    passwordChanging: false,
    
    // Статистика
    loginAttempts: 0,
    lastLoginAttempt: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    // Очистка состояний
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    clearResetStatus: (state) => {
      state.resetEmailSent = false;
      state.resetVerified = false;
    },
    clearEmailVerificationStatus: (state) => {
      state.emailVerificationSent = false;
    },
    
    // Принудительный logout (например, при истечении токена)
    forceLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = 'Сессия истекла. Войдите снова.';
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
    },
    
    // Обновление информации о пользователе локально
    updateUserInfo: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('userInfo', JSON.stringify(state.user));
      }
    },
    
    // Сброс всего состояния
    resetAuthState: () => getInitialState(),
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginAttempts += 1;
        state.lastLoginAttempt = new Date().toISOString();
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        state.success = 'Вход выполнен успешно!';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.error || 'Ошибка входа';
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;  
        state.error = null;
        state.success = 'Регистрация прошла успешно! Проверьте email для подтверждения.';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Ошибка регистрации';
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.success = 'Выход выполнен успешно';
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetEmailSent = true;
        state.success = action.payload?.message || 'Код для сброса пароля отправлен на email';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Ошибка при отправке кода';
      })
      
      // Verify Reset
      .addCase(verifyReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyReset.fulfilled, (state, action) => {
        state.loading = false;
        state.resetVerified = true;
        state.resetEmailSent = false;
        state.success = action.payload?.message || 'Пароль успешно изменен';
      })
      .addCase(verifyReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Ошибка при сбросе пароля';
      })
      
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        // Не показываем загрузку для fetch profile, так как это фоновая операция
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        // Если профиль не загрузился, возможно, токен недействителен
        if (action.payload?.details?.status === 401) {
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
        }
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.profileUpdating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.profileUpdating = false;  
        state.success = 'Профиль успешно обновлен';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileUpdating = false;
        state.error = action.payload?.error || 'Ошибка при обновлении профиля';
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.passwordChanging = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.passwordChanging = false;
        state.success = action.payload?.message || 'Пароль успешно изменен';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChanging = false;
        state.error = action.payload?.error || 'Ошибка при изменении пароля';
      })
      
      // Email Verification
      .addCase(requestEmailVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestEmailVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.emailVerificationSent = true;
        state.success = action.payload?.message || 'Письмо для подтверждения отправлено';
      })
      .addCase(requestEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Ошибка при отправке письма';
      })

      // Email Verification Submit
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload?.message || 'Email успешно подтвержден';
        state.user = { ...state.user, is_email_verified: true };
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Ошибка подтверждения email';
      });
  }
});

export const {
  clearError,
  clearSuccess,
  clearMessages,
  clearResetStatus,
  clearEmailVerificationStatus,
  forceLogout,
  updateUserInfo,
  resetAuthState
} = authSlice.actions;

// Селекторы
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.loading;
export const selectError = (state) => state.auth.error;
export const selectSuccess = (state) => state.auth.success;

export default authSlice.reducer;
