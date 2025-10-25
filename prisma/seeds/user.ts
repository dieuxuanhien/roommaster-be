import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log(`Seeding users...`);

  const hashedPassword = await bcrypt.hash('password123', 8);

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Normal User',
      password: hashedPassword,
      role: Role.USER,
      isEmailVerified: true,
      gender: 'male',
      birthYear: 1995
    }
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
      isEmailVerified: true,
      gender: 'female',
      birthYear: 1990
    }
  });

  console.log(`✓ Created/Updated normal user: ${normalUser.email} (ID: ${normalUser.id})`);
  console.log(`✓ Created/Updated admin user: ${adminUser.email} (ID: ${adminUser.id})`);
  console.log(`  Password for both users: password123`);
}
