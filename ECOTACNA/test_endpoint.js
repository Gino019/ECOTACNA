const fetch = require('node-fetch');

async function test() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const loginRes = await fetch('http://localhost:8082/ecotacna/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'petrofil@gmail.com', password: 'Password123!' })
  });
  
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  console.log("Logged in:", loginData.message);

  const reqRes = await fetch('http://localhost:8082/ecotacna/api/recolector/solicitudes-disponibles', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  const reqData = await reqRes.json();
  console.log("Response:", JSON.stringify(reqData, null, 2));
}

test().catch(console.error);
