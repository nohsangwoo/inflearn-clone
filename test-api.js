const axios = require('axios')

async function testAPI() {
  try {
    // First get cookies from login
    const loginResponse = await axios.get('http://localhost:3001/api/auth/ensure-user', {
      withCredentials: true,
      headers: {
        'Cookie': 'sb-mqdnhejdvqfhfzhqjvxf-auth-token=base64-encoded-session'
      }
    })
    console.log('Auth response:', loginResponse.status)

    // Now test the lecture endpoint
    const response = await axios.get('http://localhost:3001/api/courses/11/lecture', {
      withCredentials: true,
      headers: {
        'Cookie': 'sb-mqdnhejdvqfhfzhqjvxf-auth-token=base64-encoded-session'
      }
    })
    console.log('Lecture API response:', response.data)
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message)
  }
}

testAPI()