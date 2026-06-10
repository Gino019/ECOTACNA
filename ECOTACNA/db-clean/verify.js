const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.fhdnwwqiraybpakspegx:EcoTacnaJPA22@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    const rucs = ['20605432198', '20123456789', '20543210987'];
    
    console.log('--- VERIFICANDO EMPRESAS SIMULADAS ---');
    for (const ruc of rucs) {
      const res = await client.query('SELECT c.id, c.business_name, c.company_type, u.email FROM companies c LEFT JOIN users u ON u.company_id = c.id WHERE c.ruc = $1', [ruc]);
      if (res.rows.length > 0) {
        console.log(`[EXISTE] RUC ${ruc} - ${res.rows[0].business_name} (${res.rows[0].company_type}) - Email: ${res.rows[0].email}`);
      } else {
        console.log(`[FALTA] RUC ${ruc} NO ENCONTRADO EN LA BD.`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
