
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const professionals = await prisma.professional.findMany({
        include: { availability: true }
    });

    console.log(`Found ${professionals.length} professionals.`);

    for (const prof of professionals) {
        if (prof.availability.length === 0) {
            console.log(`Adding default availability for ${prof.name}...`);

            const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

            await prisma.professionalAvailability.createMany({
                data: days.map(day => ({
                    professionalId: prof.id,
                    dayOfWeek: day as any,
                    startTime: "09:00",
                    endTime: "19:00",
                    breakStart: "12:00",
                    breakEnd: "13:00"
                }))
            });
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
