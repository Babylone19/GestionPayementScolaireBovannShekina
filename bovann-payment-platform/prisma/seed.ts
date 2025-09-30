import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Vérifier si un admin existe déjà
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('securePassword123', 12);
    await prisma.user.create({
  data: {  
    email: 'admin@bovann.com',
    password: hashedPassword,
    role: 'ADMIN',
  },
});
    console.log('Admin user created: admin@bovann.com / securePassword123');
  } else {
    console.log(' Admin user already exists');
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