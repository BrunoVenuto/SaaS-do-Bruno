
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.update({
            where: { email: "admin@demo.com" },
            data: { isSuperAdmin: true }
        });
        console.log(`User ${user.email} is now Super Admin.`);
    } catch (e) {
        console.error("Error promoting admin@demo.com:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
