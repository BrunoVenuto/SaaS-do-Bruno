
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Middleware to check for Super Admin
async function checkSuperAdmin() {
    const session = await getAuthSession();
    if (!session?.user?.email) return null;

    // Raw query to bypass potential Prisma Client generation lag
    const users: any[] = await prisma.$queryRaw`SELECT "isSuperAdmin" FROM "User" WHERE email = ${session.user.email}`;
    const isSuperAdmin = users[0]?.isSuperAdmin;

    if (!isSuperAdmin) return null;
    return session;
}

export async function DELETE(req: Request) {
    const session = await checkSuperAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    try {
        const { tenantId } = await req.json();
        if (!tenantId) return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });

        await prisma.tenant.delete({ where: { id: tenantId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete tenant" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await checkSuperAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    try {
        const { tenantId, isActive } = await req.json();
        if (!tenantId) return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });

        // Use executeRaw to bypass Prisma Client validation (since client is outdated)
        await prisma.$executeRaw`
            UPDATE "Tenant" 
            SET "isActive" = ${isActive} 
            WHERE id = ${tenantId}
        `;

        const tenant = { id: tenantId, isActive }; // Return mock object since we updated raw

        return NextResponse.json(tenant);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update tenant" }, { status: 500 });
    }
}
