
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = "admin@demo.com"; // Promoting demo user for now, or I can search for Bruno

    // Find Bruno
    const user = await prisma.user.findFirst({
        where: { name: { contains: "Bruno", mode: "insensitive" } }
    });

    if (!user) {
        console.log("User Bruno not found. Promoting admin@demo.com");
        await prisma.user.update({
            where: { email: "admin@demo.com" },
            data: { isSuperAdmin: true }
        });
        console.log("admin@demo.com is now Super Admin.");
    } else {
        await prisma.user.update({
            where: { id: user.id },
            data: { isSuperAdmin: true }
        });
        console.log(`User ${user.name} (${user.email}) is now Super Admin.`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
