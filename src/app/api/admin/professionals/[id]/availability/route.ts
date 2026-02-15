
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { availability } = await req.json(); // Array of availability objects
    const professionalId = params.id;

    // Validate ownership
    const professional = await prisma.professional.findUnique({
        where: { id: professionalId },
        include: { tenant: true }
    });

    if (!professional) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const membership = await prisma.membership.findFirst({
        where: {
            tenantId: professional.tenantId,
            userId: session.user.id,
            role: { in: ["OWNER", "ADMIN"] }
        }
    });

    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        // Transaction: Delete existing availability and create new one
        await prisma.$transaction(async (tx) => {
            // @ts-ignore
            await tx.professionalAvailability.deleteMany({
                where: { professionalId }
            });

            if (availability && availability.length > 0) {
                // @ts-ignore
                await tx.professionalAvailability.createMany({
                    data: availability.map((a: any) => ({
                        professionalId,
                        dayOfWeek: a.dayOfWeek,
                        startTime: a.startTime,
                        endTime: a.endTime,
                        breakStart: a.breakStart || null,
                        breakEnd: a.breakEnd || null,
                    }))
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving availability:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
