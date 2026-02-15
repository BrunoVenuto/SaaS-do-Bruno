
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlots } from "@/lib/slots";
import { endOfDay, startOfDay } from "date-fns";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const professionalId = searchParams.get("professionalId");
    const serviceId = searchParams.get("serviceId");
    const dateString = searchParams.get("date"); // YYYY-MM-DD

    if (!professionalId || !serviceId || !dateString) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Fix: Parse as local time to avoid timezone shift on local servers
    // And widen query window to handle timezone differences between Server and Tenant
    const date = new Date(`${dateString}T00:00:00`);
    const start = startOfDay(date);
    const end = endOfDay(date);

    // Widen the search window significantly to ensure we catch all appointments 
    // regardless of timezone differences (e.g. UTC server vs UTC-3 Tenant)
    // We filter strictly in generateSlots anyway.
    const queryStart = new Date(start.getTime() - 24 * 60 * 60 * 1000); // -24h
    const queryEnd = new Date(end.getTime() + 24 * 60 * 60 * 1000);   // +24h

    const appointments = await prisma.appointment.findMany({
        where: {
            professionalId,
            startAt: { gte: queryStart, lte: queryEnd },
            status: { not: "CANCELLED" }
        }
    });

    // 1. Get Professional Availability
    const professional = await prisma.professional.findUnique({
        where: { id: professionalId },
        include: {
            // @ts-ignore
            availability: true,
            tenant: true
        }
    });

    if (!professional) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

    // 2. Get Service Duration
    const service = await prisma.service.findUnique({
        where: { id: serviceId }
    });

    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    // @ts-ignore
    const slots = generateSlots(date, service.durationMin, professional.availability, appointments, professional.tenant.timezone || "America/Sao_Paulo");

    console.log(`[Slots API] Generated ${slots.length} slots`);

    return NextResponse.json({ slots });
}
