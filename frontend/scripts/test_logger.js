const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_xgK6coQO2IzA@ep-calm-brook-at0zflui-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function logAudit(userId, action, details = {}) {
  await sql`
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (${userId || 'anonymous'}, ${action}, ${JSON.stringify(details)}::jsonb)
  `;
}

async function test() {
  await logAudit('test-user-3', 'TEST_STRINGIFY', { test: true });
  const logs = await sql`SELECT details FROM audit_logs WHERE action = 'TEST_STRINGIFY' ORDER BY created_at DESC LIMIT 1`;
  console.log('TYPEOF:', typeof logs[0].details, logs[0].details);
}

test();
