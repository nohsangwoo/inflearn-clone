import fetch from 'node-fetch';

async function testAPI() {
  console.log('Testing /api/courses/11/lecture endpoint...\n');

  try {
    // Test without authentication first
    console.log('1. Testing without auth...');
    const response1 = await fetch('http://localhost:3001/api/courses/11/lecture');
    console.log('   Status:', response1.status);
    const data1 = await response1.json();
    console.log('   Response:', data1);

    // Get cookie from browser
    console.log('\n2. Please copy the authentication cookie from browser');
    console.log('   Open DevTools > Application > Cookies');
    console.log('   Look for cookies starting with "sb-"');

    // Test with a mock authenticated request
    console.log('\n3. Testing URL structure...');
    const testUrls = [
      'http://localhost:3001/api/courses/11/lecture',
      'http://localhost:3001/api/courses/11/lecture/',
      'http://localhost:3001/api/courses/lecture/11',
    ];

    for (const url of testUrls) {
      const res = await fetch(url);
      console.log(`   ${url} => ${res.status}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();