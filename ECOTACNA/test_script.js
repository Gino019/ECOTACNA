const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const client = new Client({ connectionString: 'postgres://postgres.fhdnwwqiraybpakspegx:EcoTacnaJPA22@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require' });
async function run() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  await client.connect();
  const hash = bcrypt.hashSync('Password123!', 10);
  await client.query('UPDATE users SET password = $1 WHERE email = $2', [hash, 'serviciosnova@gmail.com']);
  console.log('Password updated.');
  await client.end();

  const fetch = globalThis.fetch;
  const loginRes = await fetch('http://localhost:8082/ecotacna/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'serviciosnova@gmail.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;
  console.log('Logged in', token ? 'success' : 'failed');
  
  if (token) {
    const reqRes = await fetch('http://localhost:8082/ecotacna/api/recolector/solicitudes-disponibles', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const reqData = await reqRes.json();
    console.log('API Response:', JSON.stringify(reqData, null, 2));
  }
}
run().catch(console.error);
