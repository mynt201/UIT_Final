// Test getUsers API
const axios = require('axios');

async function testGetUsers() {
  try {
    console.log('Testing GET /api/users (get all users)...');
    const response = await axios.get('http://localhost:5000/api/users', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJtb2NrXzEiLCJpYXQiOjE3MzUyODk2MDAsImV4cCI6MTc2Njg0OTYwMH0.example_token'
      }
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testGetUsers();