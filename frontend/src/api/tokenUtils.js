// Утилиты для работы с токенами
const API_BASE_URL = 'http://localhost:8000/api/auth';

export const refreshToken = async () => {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshTokenValue
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    
    // Сохраняем новый токен
    localStorage.setItem('accessToken', data.access);
    
    return data.access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Очищаем токены при ошибке
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    throw error;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};
