const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { neon } = require('@neondatabase/serverless');
const logDbUrl = 'postgresql://neondb_owner:npg_xgK6coQO2IzA@ep-calm-brook-at0zflui-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function test() {
  try {
    const sql = neon(logDbUrl);
    const logs = await sql`SELECT id, user_id, action, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 10`;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const userIds = Array.from(new Set(logs.map(log => log.user_id).filter(id => id && id !== 'anonymous' && uuidRegex.test(id))));
    console.log('Valid User IDs to query:', userIds);
    if (userIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true, email: true }
      });
      console.log('Found users:', users);
    }
  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}
test();
