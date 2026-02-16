
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { tenantId, name, address, phone } = body;

        if (!tenantId || !name) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Verify ownership/admin rights
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { memberships: true }
        });

        const membership = user?.memberships.find(m => m.tenantId === tenantId);

        if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update Tenant
        await prisma.tenant.update({
            where: { id: tenantId },
            data: { name, address, phone }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Update settings error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
