require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  const tables = res.rows.map(r => r.table_name);

  for (const table of tables) {
    try {
      await client.query(`ALTER TABLE "${table}" SET (schema_locked = false);`);
      console.log(`Unlocked ${table}`);
    } catch (e) {
      console.error(`Could not unlock ${table}`, e.message);
    }
  }

  await client.end();
}

main();
