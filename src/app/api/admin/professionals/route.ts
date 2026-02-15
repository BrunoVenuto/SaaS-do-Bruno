
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/activeTenant";

export async function GET(req: Request) {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tenantId = getActiveTenantId();
    if (!tenantId) return NextResponse.json({ error: "Tenant not selected" }, { status: 400 });

    const professionals = await prisma.professional.findMany({
        where: { tenantId },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(professionals);
}

export async function POST(req: Request) {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tenantId = getActiveTenantId();
    if (!tenantId) return NextResponse.json({ error: "Tenant not selected" }, { status: 400 });

    try {
        const body = await req.json();
        const { name, phone, commissionType, commissionValue } = body;

        if (!name) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const professional = await prisma.professional.create({
            data: {
                tenantId,
                name,
                phone,
                commissionType: commissionType || "PERCENT",
                commissionValue: commissionValue ? Number(commissionValue) : 50,
                isActive: true,
            },
        });

        return NextResponse.json(professional);
    } catch (error) {
        return NextResponse.json({ error: "Error creating professional" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tenantId = getActiveTenantId();
    if (!tenantId) return NextResponse.json({ error: "Tenant not selected" }, { status: 400 });

    try {
        const { id, isActive } = await req.json();

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // Validate ownership
        const professional = await prisma.professional.findUnique({
            where: { id },
        });

        if (!professional || professional.tenantId !== tenantId) {
            return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
        }

        const updated = await prisma.professional.update({
            where: { id },
            data: { isActive },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Error updating professional" }, { status: 500 });
    }
}
