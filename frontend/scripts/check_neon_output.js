const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_xgK6coQO2IzA@ep-calm-brook-at0zflui-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function test() {
  const logs = await sql`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5`;
  logs.forEach(log => {
    console.log(log.action, typeof log.details, log.details);
  });
}
test();
