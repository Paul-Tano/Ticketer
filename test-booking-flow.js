const axios = require('axios');

async function run() {
  try {
    // 1. Get session cookie (login page might set one, but we need to post login)
    // Actually, just POST to /login
    const loginRes = await axios.post('http://localhost:3000/login', {
      email: 'admin@ticketer.com', // wait, do we have an admin or normal user? Let's use user.
      password: 'password' // I don't know the password...
    }, {
      validateStatus: () => true
    });
    console.log('Login status:', loginRes.status);
    console.log('Headers:', loginRes.headers);
  } catch(e) {
    console.error(e);
  }
}
run();
