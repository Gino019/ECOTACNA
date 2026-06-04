const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.fhdnwwqiraybpakspegx:EcoTacnaJPA22@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require'
});

async function run() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  await client.connect();
  console.log("Connected to Supabase.");

  const res = await client.query('SELECT id, status, approximate_volume_liters, requested_at, scheduled_at, collector_user_id, company_id FROM pickup_requests ORDER BY id DESC');
  console.log("ALL PICKUP REQUESTS:", res.rows);

  await client.end();
}

run().catch(console.error);
