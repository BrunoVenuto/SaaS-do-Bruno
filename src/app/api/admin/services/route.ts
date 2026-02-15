
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/activeTenant";

export async function GET(req: Request) {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tenantId = getActiveTenantId();
    if (!tenantId) return NextResponse.json({ error: "Tenant not selected" }, { status: 400 });

    const services = await prisma.service.findMany({
        where: { tenantId },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(services);
}

export async function POST(req: Request) {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tenantId = getActiveTenantId();
    if (!tenantId) return NextResponse.json({ error: "Tenant not selected" }, { status: 400 });

    try {
        const { name, durationMin, priceCents } = await req.json();

        if (!name || !durationMin || priceCents === undefined) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const service = await prisma.service.create({
            data: {
                tenantId,
                name,
                durationMin: Number(durationMin),
                priceCents: Number(priceCents),
                isActive: true,
            },
        });

        return NextResponse.json(service);
    } catch (error) {
        return NextResponse.json({ error: "Error creating service" }, { status: 500 });
    }
}
