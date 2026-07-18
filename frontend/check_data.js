const { Client } = require('pg');

const cockroachUrl = "postgresql://jinto:GaHQko4Kw8HcHwuJnckvRw@blitz-pegasus-18559.jxf.gcp-asia-south1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";
const neonUrl = "postgresql://neondb_owner:npg_iIoWcP9yg7VB@ep-fragrant-heart-adhfyuuq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&pgbouncer=true&connect_timeout=30&pool_timeout=30";

async function checkData() {
  const crClient = new Client({ connectionString: cockroachUrl });
  const neonClient = new Client({ connectionString: neonUrl });

  try {
    await crClient.connect();
    await neonClient.connect();

    console.log("CockroachDB Connection OK");
    const crRes = await crClient.query('SELECT count(*) FROM "User"');
    console.log("CockroachDB Users count:", crRes.rows[0].count);

    const neonRes = await neonClient.query('SELECT count(*) FROM "User"');
    console.log("Neon Users count:", neonRes.rows[0].count);

  } catch (e) {
    console.error("Error:", e);
  } finally {
    await crClient.end();
    await neonClient.end();
  }
}

checkData();
