const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const userId = "test";
    const x = await prisma.userJourneyNode.count({ where: { userId, completedAt: { not: null } } });
    console.log("Success userJourneyNode");
  } catch (e) {
    console.error("ERROR in userJourneyNode:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
