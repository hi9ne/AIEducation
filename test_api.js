const axios = require('axios');

async function testAPI() {
  console.log('=== Testing API Endpoints ===');
  
  // Тестируем доступность endpoints
  const endpoints = [
    'http://localhost:8000/api/auth/profile/',
    'http://localhost:8000/api/profile/profile/',
    'http://localhost:8000/api/auth/token/refresh/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting: ${endpoint}`);
      const response = await axios.get(endpoint, { timeout: 3000 });
      console.log(`✅ Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ Status: ${error.response?.status || 'No response'}`);
      console.log(`   Error: ${error.response?.data?.detail || error.message}`);
    }
  }
}

testAPI().catch(console.error);
