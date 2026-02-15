import { prisma } from "../src/lib/prisma";
import { addDays, startOfHour } from "date-fns";

async function main() {
    console.log("Searching for a tenant...");
    const tenant = await prisma.tenant.findFirst({
        include: { professionals: true, services: true }
    });

    if (!tenant) {
        console.log("No tenant found. Please register via the UI first.");
        return;
    }

    const professional = tenant.professionals[0];
    const service = tenant.services[0];

    if (!professional || !service) {
        console.log("Tenant incomplete (missing professional or service).");
        return;
    }

    console.log(`Using Tenant: ${tenant.name}`);
    console.log(`Updating Professional ${professional.name} with phone...`);

    await prisma.professional.update({
        where: { id: professional.id },
        data: { phone: "31999998888" }
    });

    console.log("Creating test appointment...");

    // Find a customer or create one
    let customer = await prisma.customer.findFirst({ where: { tenantId: tenant.id } });
    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                tenantId: tenant.id,
                name: "Test Customer",
                phone: "000000000"
            }
        });
    }

    const startAt = startOfHour(addDays(new Date(), 1));
    const endAt = new Date(startAt.getTime() + service.durationMin * 60000);

    const appointment = await prisma.appointment.create({
        data: {
            tenantId: tenant.id,
            customerId: customer.id,
            professionalId: professional.id,
            serviceId: service.id,
            startAt: startAt,
            endAt: endAt,
            status: "CONFIRMED"
        }
    });

    console.log("\n✅ Test Setup Complete!");
    console.log(`Check the Success Page here:`);
    console.log(`http://localhost:3000/book/success?id=${appointment.id}`);
    console.log("\nYou should see a 'Avisar Profissional no WhatsApp' button linking to wa.me/5531999998888");
}

main();
