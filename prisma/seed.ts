import { PrismaClient } from '../app/generated/prisma';
import { Role } from './enums';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding database...');
    
    // Check if admin already exists to avoid duplicates
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: '15@agent-universe.cn',
      },
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists, skipping creation');
      return;
    }
    
    // Hash password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Administrator',
        email: '15@agent-universe.cn',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    
    console.log(`Created admin user with ID: ${admin.id}`);
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
