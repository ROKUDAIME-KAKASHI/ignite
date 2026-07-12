const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const subs = await prisma.pushSubscription.findMany({
      take: 5,
      select: {
        id: true,
        endpoint: true,
        p256dh: true,
        auth: true,
        userId: true,
        createdAt: true
      }
    });
    console.log("SUBS DETAILS:", JSON.stringify(subs, null, 2));
  } catch (e) {
    console.error("DATABASE QUERY FAILED:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
