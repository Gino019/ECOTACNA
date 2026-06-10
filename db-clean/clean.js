const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.fhdnwwqiraybpakspegx:EcoTacnaJPA22@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    
    // Find company by RUC
    const resComp = await client.query('SELECT id FROM companies WHERE ruc = $1', ['20605432198']);
    const companyId = resComp.rows.length > 0 ? resComp.rows[0].id : null;
    
    // Find user by email
    const resUser = await client.query('SELECT id, company_id FROM users WHERE email = $1', ['gerencia@sabor.com']);
    const userId = resUser.rows.length > 0 ? resUser.rows[0].id : null;
    const userCompanyId = resUser.rows.length > 0 ? resUser.rows[0].company_id : null;
    
    console.log('Company ID:', companyId, 'User ID:', userId);

    const targetCompanyId = companyId || userCompanyId;

    if (userId) {
      await client.query('DELETE FROM audit_logs WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      console.log('Deleted user');
    }

    if (targetCompanyId) {
      await client.query('DELETE FROM subscriptions WHERE company_id = $1', [targetCompanyId]);
      await client.query('DELETE FROM companies WHERE id = $1', [targetCompanyId]);
      console.log('Deleted company');
    }

    console.log('Cleanup successful!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
