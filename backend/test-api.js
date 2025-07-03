
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Hospital Management API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Database Health Check
    console.log('2️⃣ Testing Database Connection...');
    try {
      const dbHealthResponse = await axios.get(`${BASE_URL}/health/db`);
      console.log('✅ Database Health:', dbHealthResponse.data);
    } catch (dbError) {
      console.log('⚠️ Database Health:', dbError.response?.data || dbError.message);
    }
    console.log('');

    // Test 3: Register User
    console.log('3️⃣ Testing User Registration...');
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'patient'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('✅ Registration successful:', {
        message: registerResponse.data.message,
        userId: registerResponse.data.user?.id
      });
      
      // Test 4: Login
      console.log('');
      console.log('4️⃣ Testing User Login...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: registerData.email,
        password: registerData.password
      });
      console.log('✅ Login successful:', {
        message: loginResponse.data.message,
        token: loginResponse.data.token ? 'Token received' : 'No token'
      });

    } catch (authError) {
      console.log('⚠️ Auth Error:', authError.response?.data || authError.message);
    }

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

// Run the test
testAPI();
