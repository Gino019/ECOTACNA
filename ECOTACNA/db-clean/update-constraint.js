const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.fhdnwwqiraybpakspegx:EcoTacnaJPA22@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    
    console.log('--- DROP CONSTRAINT ---');
    await client.query('ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_subscription_status_check;');
    
    console.log('--- ADD CONSTRAINT ---');
    await client.query(`
      ALTER TABLE companies
      ADD CONSTRAINT companies_subscription_status_check
      CHECK (
        subscription_status IN (
          'PENDIENTE',
          'PENDIENTE_PAGO',
          'PRUEBA_ACTIVA',
          'ACTIVA',
          'VENCIDA',
          'SUSPENDIDA',
          'CANCELADA'
        )
      );
    `);
    
    console.log('--- VERIFYING CONSTRAINT ---');
    const res = await client.query(`
      SELECT conname, pg_get_constraintdef(oid)
      FROM pg_constraint
      WHERE conname = 'companies_subscription_status_check';
    `);
    
    console.log(JSON.stringify(res.rows, null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
