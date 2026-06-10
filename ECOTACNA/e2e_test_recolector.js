const fetch = global.fetch || require('node-fetch');

const BASE = 'http://localhost:8085/ecotacna';
const EMAIL = 'serviciosnova@gmail.com';
const PASSWORD = 'Password123!';

async function run() {
  try {
    const loginRes = await fetch(BASE + '/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.success && !loginJson.data) {
      console.error('Login failed', loginJson);
      return;
    }
    const token = (loginJson.data && loginJson.data.token) || loginJson.data?.token || loginJson.token || loginJson.data;
    console.log('Token obtained');

    // list available
    let res = await fetch(BASE + '/api/recolector/solicitudes-disponibles', { headers: { 'Authorization': 'Bearer ' + token } });
    let json = await res.json();
    console.log('Available requests:', JSON.stringify(json, null, 2));
    const list = json.data || json;
    if (!list || list.length === 0) {
      console.error('No available requests to accept.');
      return;
    }
    const id = list[0].id;
    console.log('Accepting request id', id);
    res = await fetch(BASE + `/api/recolector/solicitudes/${id}/aceptar`, { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } });
    json = await res.json();
    console.log('Accept response:', JSON.stringify(json, null, 2));

    // start route
    res = await fetch(BASE + `/api/recolector/recojos/${id}/en-ruta`, { method: 'PUT', headers: { 'Authorization': 'Bearer ' + token } });
    json = await res.json();
    console.log('En ruta response:', JSON.stringify(json, null, 2));

    // confirm pickup with volumenReal = volume approx if present
    const volumen = json.data?.volumenAproximado || 10;
    res = await fetch(BASE + `/api/recolector/recojos/${id}/confirmar`, { method: 'PUT', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ volumenReal: volumen }) });
    json = await res.json();
    console.log('Confirmar response:', JSON.stringify(json, null, 2));

    // try download constancia as recolector
    res = await fetch(BASE + `/api/recolector/solicitudes/${id}/constancia`, { headers: { 'Authorization': 'Bearer ' + token } });
    if (res.status === 200) {
      const buf = await res.arrayBuffer();
      console.log('Constancia downloaded, bytes:', buf.byteLength);
    } else {
      const text = await res.text();
      console.log('Constancia not available, status', res.status, text);
    }

  } catch (e) {
    console.error('Error', e.message || e);
  }
}

run();
