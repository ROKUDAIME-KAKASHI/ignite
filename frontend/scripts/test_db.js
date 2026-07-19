require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { neon } = require('@neondatabase/serverless');

async function check() {
  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Messages:', messages);
}
check().catch(console.error).finally(() => prisma.$disconnect());
