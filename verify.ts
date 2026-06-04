import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';

async function verifyBackend() {
  console.log('🔄 Starting EduERP Backend Verification...\n');
  let token = '';

  // 1. Test Auth Module
  try {
    console.log('Testing [POST] /auth/login...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@eduerp.com',
      password: 'Admin@123456',
    });
    token = response.data.accessToken;
    console.log('✅ Auth successful! Token received.\n');
  } catch (error: any) {
    console.error('❌ Auth failed:', error.response?.data || error.message);
    process.exit(1);
  }

  const headers = { Authorization: `Bearer ${token}` };

  // 2. Test Classes Module
  try {
    console.log('Testing [GET] /classes...');
    const response = await axios.get(`${API_URL}/classes`, { headers });
    console.log(`✅ Classes fetched: ${response.data.length} found.\n`);
  } catch (error: any) {
    console.error('❌ Classes failed:', error.response?.data || error.message);
  }

  // 3. Test Students Module
  try {
    console.log('Testing [GET] /students...');
    const response = await axios.get(`${API_URL}/students`, { headers });
    console.log(`✅ Students fetched: ${response.data.data ? response.data.data.length : response.data.length} found.\n`);
  } catch (error: any) {
    console.error('❌ Students failed:', error.response?.data || error.message);
  }

  // 4. Test Teachers Module
  try {
    console.log('Testing [GET] /teachers...');
    const response = await axios.get(`${API_URL}/teachers`, { headers });
    console.log(`✅ Teachers fetched: ${response.data.length} found.\n`);
  } catch (error: any) {
    console.error('❌ Teachers failed:', error.response?.data || error.message);
  }

  // 5. Test Dashboard Stats
  try {
    console.log('Testing [GET] /dashboard/stats...');
    const response = await axios.get(`${API_URL}/dashboard/stats`, { headers });
    console.log(`✅ Dashboard stats fetched:`, response.data, '\n');
  } catch (error: any) {
    console.error('❌ Dashboard stats failed:', error.response?.data || error.message);
  }
  
  console.log('🎉 Verification process completed.');
}

verifyBackend();
