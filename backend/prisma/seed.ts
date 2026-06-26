import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const mission = await prisma.mission.create({
    data: {
      title: 'Acts of Charity',
      description: "Reach out to a friend you haven't spoken to in a while and offer a prayer.",
      xpReward: 50,
    },
  });

  await prisma.dailyJourney.create({
    data: {
      date: new Date(new Date().setHours(0, 0, 0, 0)),
      verse: "I can do all things through Christ who strengthens me.",
      verseRef: "Philippians 4:13",
      reflection: "Today, reflect on the strength that comes not from within, but from your faith. When facing challenges, remember that you are never alone.",
      prayer: "Lord, grant me the strength to face today's challenges with grace and love. Help me to be a beacon of your light to others. Amen.",
      missionId: mission.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
