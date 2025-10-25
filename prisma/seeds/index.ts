import { seedQuizBDI } from './quiz';
import { seedUsers } from './user';

const main = async () => {
  console.log('🌱 Starting database seeding...\n');

  await seedUsers();

  await seedQuizBDI();

  console.log('✅ Database seeding completed successfully!');
  process.exit(0);
};

main();
