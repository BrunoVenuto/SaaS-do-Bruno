
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@barbersaas.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: { isSuperAdmin: true },
            create: {
                email,
                passwordHash: hashedPassword,
                name: 'Super Admin',
                isSuperAdmin: true,
            },
        });
        console.log('Super Admin user created/updated:', user);
    } catch (e) {
        console.error('Error creating super admin:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
