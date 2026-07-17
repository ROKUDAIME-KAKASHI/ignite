require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const logDbUrl = process.env.LOG_DATABASE_URL || 'postgresql://neondb_owner:npg_xgK6coQO2IzA@ep-calm-brook-at0zflui-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require'; 
const sql = neon(logDbUrl); 

const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Audit log timeout")), 1500));

async function run() {
    try {
        await Promise.race([
            sql`INSERT INTO audit_logs (user_id, action, details) VALUES ('test-user', 'TEST3', '{}'::jsonb)`,
            timeout
        ]);
        console.log("Success");
    } catch(e) {
        console.error("Error:", e.message);
    }
}
run();
