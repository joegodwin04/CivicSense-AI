const axios = require('axios');
const fs = require('fs');

async function run() {
  try {
    const user = {
      name: 'Test Citizen 2',
      email: 'citizen' + Date.now() + '@test.com',
      password: 'password123',
      role: 'citizen'
    };
    const regRes = await axios.post('http://localhost:5000/api/auth/register', user);
    const token = regRes.data.data.token;
    console.log('Registered User:', regRes.data.data._id);

    const submitRes = await axios.post('http://localhost:5000/api/citizen/submit', {
      description: 'Test duplicate logic ' + Date.now(),
      latitude: 12.9716, // Bengaluru center (should trigger duplicate)
      longitude: 77.5946
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Submit Success:', submitRes.data.isDuplicate ? 'DUPLICATE' : 'NEW');
    console.log('Saved Request ID:', submitRes.data.data._id);

    // Now check if dashboard stats work
    const statsRes = await axios.get('http://localhost:5000/api/citizen/my-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('My Stats Total:', statsRes.data.data.total); // Should be 1

    const reqsRes = await axios.get('http://localhost:5000/api/citizen/my-requests', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('My Requests count:', reqsRes.data.count); // Should be 1

  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
run();
