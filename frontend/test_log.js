const { neon } = require('@neondatabase/serverless');

process.env.LOG_DATABASE_URL = 'postgresql://neondb_owner:npg_xgK6coQO2IzA@ep-calm-brook-at0zflui-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function test() {
  const sql = neon(process.env.LOG_DATABASE_URL);
  
  await sql`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES ('test-user', 'TEST_ACTION', '{"test": true}'::jsonb)
  `;
  console.log('Logged test action');
}

test().catch(console.error);
