const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_xgK6coQO2IzA@ep-calm-brook-at0zflui-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
sql`SELECT * FROM audit_logs LIMIT 5`.then(console.log).catch(console.error);
