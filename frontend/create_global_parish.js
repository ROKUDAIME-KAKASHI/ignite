const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.church.findUnique({ where: { inviteCode: 'IGNITE' } });
  if (existing) {
    console.log("IGNITE parish already exists!");
    return;
  }
  
  const church = await prisma.church.create({
    data: {
      name: "Ignite Global Community",
      location: "Worldwide",
      inviteCode: "IGNITE"
    }
  });
  
  console.log("Successfully created Ignite Global Parish!", church);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
