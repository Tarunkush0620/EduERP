const API_URL = 'http://localhost:3001/api/v1';

async function verifyBackend() {
  console.log('🔄 Starting EduERP Backend Verification...\n');
  let token = '';

  // 1. Test Auth Module
  try {
    console.log('Testing [POST] /auth/login...');
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@eduerp.com', password: 'Admin@123456' })
    });
    
    if (!res.ok) throw new Error(await res.text());
    
    const data = await res.json();
    console.log('✅ Auth successful! Response Data:', data);
    token = data.data?.accessToken || data.accessToken;
    if (!token) throw new Error('No access token received');
  } catch (error) {
    console.error('❌ Auth failed:', error.message);
    process.exit(1);
  }

  const headers = { Authorization: `Bearer ${token}` };

  // 2. Test Classes Module
  try {
    console.log('Testing [GET] /classes...');
    const res = await fetch(`${API_URL}/classes`, { headers });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    console.log(`✅ Classes fetched: ${data.length} found.\n`);
  } catch (error) {
    console.error('❌ Classes failed:', error.message);
  }

  // 3. Test Students Module
  try {
    console.log('Testing [GET] /students...');
    const res = await fetch(`${API_URL}/students`, { headers });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const count = Array.isArray(data.data) ? data.data.length : data.length;
    console.log(`✅ Students fetched: ${count} found.\n`);
  } catch (error) {
    console.error('❌ Students failed:', error.message);
  }

  // 4. Test Teachers Module
  try {
    console.log('Testing [GET] /teachers...');
    const res = await fetch(`${API_URL}/teachers`, { headers });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    console.log(`✅ Teachers fetched: ${data.length} found.\n`);
  } catch (error) {
    console.error('❌ Teachers failed:', error.message);
  }

  // 5. Test Dashboard Stats
  try {
    console.log('Testing [GET] /dashboard/admin...');
    const res = await fetch(`${API_URL}/dashboard/admin`, { headers });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    console.log(`✅ Dashboard stats fetched:`, Object.keys(data), '\n');
  } catch (error) {
    console.error('❌ Dashboard stats failed:', error.message);
  }
  
  console.log('🎉 Verification process completed.');
}

verifyBackend();
