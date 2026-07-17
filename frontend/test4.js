require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const logDbUrl = process.env.LOG_DATABASE_URL || 'postgresql://neondb_owner:npg_xgK6coQO2IzA@ep-calm-brook-at0zflui-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require'; 
const sql = neon(logDbUrl); 

async function run() {
    try {
        const details = { test: true };
        await sql`INSERT INTO audit_logs (user_id, action, details) VALUES ('test-user', 'TEST4', ${JSON.stringify(details)}::jsonb)`;
        console.log("Success");
    } catch(e) {
        console.error("Error:", e.message);
    }
}
run();
