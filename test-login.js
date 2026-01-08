// Simple test script to check login API
const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login API...');

    const response = await axios.post('http://localhost:3000/api/users/login', {
      email: 'admin@floodrisk.com',
      password: 'admin123'
    });

    console.log('✅ Login successful!');
    console.log('Response:', response.data);

  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}

testLogin();
