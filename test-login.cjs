// Simple test script to check login API
const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login API...');

    const response = await axios.post('http://localhost:3000/api/users/login', {
      email: 'admin@floodrisk.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('Token received:', response.data.token ? 'Yes' : 'No');

  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Status text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Error message:', error.message);
  }
}

testLogin();
