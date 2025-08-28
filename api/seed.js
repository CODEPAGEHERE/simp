const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      { name: 'timesync' },
      { name: 'scheduler' },
    ],
  });

  await prisma.category.createMany({
    data: [
      { name: 'personal' },
      { name: 'church/mosque' },
      { name: 'event planner' },
      { name: 'club and society' },
      { name: 'community' },
    ],
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
