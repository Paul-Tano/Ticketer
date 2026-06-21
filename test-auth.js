const axios = require('axios');
const http = require('http');

async function test() {
  const instance = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
  });
  
  try {
    const loginRes = await instance.post('/login', {
      email: 'test1@test.com',
      password: 'password123'
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const cookie = loginRes.headers['set-cookie'][0].split(';')[0];
    console.log("Cookie received:", cookie);
    
    const homeRes = await instance.get('/', {
      headers: { Cookie: cookie }
    });
    
    if (homeRes.data.includes('Se connecter')) {
      console.log("FAILED: 'Se connecter' button is still visible.");
    } else {
      console.log("SUCCESS: User is logged in.");
    }
  } catch (e) {
    console.error(e.message);
  }
}
test();
