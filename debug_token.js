const axios = require('axios');

// Функция для декодирования JWT токена
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (error) {
    console.error('Error decoding JWT:', error.message);
    return null;
  }
}

// Функция для тестирования API запроса
async function testAPIRequest(token) {
  try {
    const response = await axios.get('http://localhost:8000/api/profile/profile/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ API Request successful:', response.status);
    console.log('Response data:', response.data);
    return true;
  } catch (error) {
    console.log('❌ API Request failed:', error.response?.status);
    console.log('Error details:', error.response?.data);
    return false;
  }
}

// Основная функция
async function main() {
  console.log('=== JWT Token Debug ===');
  
  // Получаем токен из аргументов командной строки
  const token = process.argv[2];
  
  if (!token) {
    console.log('Usage: node debug_token.js <your_jwt_token>');
    console.log('To get your token, open browser console and run: localStorage.getItem("accessToken")');
    return;
  }
  
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // Декодируем токен
  const payload = decodeJWT(token);
  if (payload) {
    console.log('\n=== Token Payload ===');
    console.log('User ID:', payload.user_id);
    console.log('Expires at:', new Date(payload.exp * 1000).toISOString());
    console.log('Is expired:', Date.now() > payload.exp * 1000);
    console.log('Token type:', payload.token_type);
  }
  
  // Тестируем API запрос
  console.log('\n=== Testing API Request ===');
  await testAPIRequest(token);
}

main().catch(console.error);
