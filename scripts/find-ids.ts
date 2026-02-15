
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const professional = await prisma.professional.findFirst({
        include: { tenant: true }
    });
    const service = await prisma.service.findFirst({
        where: { tenantId: professional?.tenantId }
    });

    if (professional && service) {
        console.log(`Professional ID: ${professional.id}`);
        console.log(`Service ID: ${service.id}`);
        console.log(`Tenant Timezone: ${professional.tenant.timezone}`);
    } else {
        console.log("No data found");
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
