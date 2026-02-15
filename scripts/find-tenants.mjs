
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const tenants = await prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log("Latest Tenants:");
        tenants.forEach(t => {
            console.log(`- Name: ${t.name}, ID: ${t.id}, CreatedAt: ${t.createdAt}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
