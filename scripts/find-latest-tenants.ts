
import { prisma } from "../src/lib/prisma";

async function main() {
    const tenants = await prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            users: { // actually it is memberships
                include: { user: true }
            }
        }
    });

    console.log("Latest Tenants:");
    tenants.forEach(t => {
        console.log(`- Name: ${t.name}, ID: ${t.id}, CreatedAt: ${t.createdAt}`);
    });
}

main();
