
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, barbershopName } = body;

    if (!name || !email || !password || !barbershopName) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      // 2. Create Tenant (Barbershop)
      let slug = barbershopName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

      // Basic collision avoidance (append random if needed? for now just try)
      // Ideally we check if slug exists, but for MVP let's just append a short random string if it's too common or just let unique constraint fail (user sees error).
      // Let's make it slightly more robust by appending 4 random chars if we wanted, but let's stick to simple first.

      const tenant = await tx.tenant.create({
        data: {
          name: barbershopName,
          slug: slug,
        },
      });

      // 3. Create Membership (Owner)
      await tx.membership.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          role: "OWNER",
        },
      });

      // 4. Create Initial Professional (The Owner)
      await tx.professional.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          name: name,
          isActive: true
        }
      });

      return { user, tenant };
    });

    return NextResponse.json({ success: true, userId: result.user.id, tenantId: result.tenant.id });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Erro ao criar conta. Tente novamente." }, { status: 500 });
  }
}
