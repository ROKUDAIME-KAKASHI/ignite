const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_xgK6coQO2IzA@ep-calm-brook-at0zflui-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id VARCHAR(255),
          action VARCHAR(255) NOT NULL,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log("Table audit_logs created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  }
}
main();
