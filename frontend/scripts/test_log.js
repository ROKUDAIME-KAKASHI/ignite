const { neon } = require('@neondatabase/serverless');

process.env.LOG_DATABASE_URL = process.env.LOG_DATABASE_URL || 'postgres://user:pass@host/db'; // REPLACE BEFORE RUNNING

async function test() {
  const sql = neon(process.env.LOG_DATABASE_URL);
  
  await sql`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES ('test-user', 'TEST_ACTION', '{"test": true}'::jsonb)
  `;
  console.log('Logged test action');
}

test().catch(console.error);
