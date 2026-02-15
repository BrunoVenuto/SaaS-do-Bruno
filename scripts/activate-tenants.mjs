
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.tenant.updateMany({
            data: { isActive: true }
        });
        console.log(`Updated ${result.count} tenants to Active.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
