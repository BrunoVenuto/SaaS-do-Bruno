
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenants = await prisma.tenant.findMany({
        where: { slug: null }
    });

    console.log(`Found ${tenants.length} tenants without slug.`);

    for (const tenant of tenants) {
        let slug = tenant.name.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        if (!slug) slug = `tenant-${tenant.id.slice(0, 8)}`;

        console.log(`Updating ${tenant.name} -> ${slug}`);

        // Check if slug exists
        const exists = await prisma.tenant.findUnique({ where: { slug } });
        if (exists) {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
            console.log(`Slug taken, trying ${slug}`);
        }

        try {
            await prisma.tenant.update({
                where: { id: tenant.id },
                data: { slug }
            });
        } catch (error) {
            console.error(`Failed to update ${tenant.name}:`, error);
        }
    }

    console.log("Done!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
