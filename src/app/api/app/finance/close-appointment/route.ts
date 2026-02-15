import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function getTenantId() {
  const t = cookies().get("x-tenant-id")?.value;
  if (!t) throw new Error("TENANT_NOT_SELECTED");
  return t;
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.email) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const tenantId = getTenantId();
  const form = await req.formData();
  const appointmentId = String(form.get("appointmentId") || "");
  const method = String(form.get("method") || "pix");

  await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.findFirst({
      where: { id: appointmentId, tenantId },
      include: { service: true, professional: true },
    });
    if (!appt) throw new Error("NOT_FOUND");
    if (appt.status !== "CONFIRMED") throw new Error("INVALID_STATUS");

    await tx.appointment.update({ where: { id: appt.id }, data: { status: "DONE" } });

    await tx.transaction.create({
      data: {
        tenantId,
        occurredAt: new Date(),
        type: "INCOME",
        amountCents: appt.service.priceCents,
        method,
        category: "service",
        appointmentId: appt.id,
      },
    });

    const comm =
      appt.professional.commissionType === "PERCENT"
        ? Math.round((appt.service.priceCents * appt.professional.commissionValue) / 100)
        : appt.professional.commissionValue;

    await tx.commission.create({
      data: {
        tenantId,
        appointmentId: appt.id,
        professionalId: appt.professionalId,
        amountCents: comm,
      },
    });
  });

  return NextResponse.redirect(new URL("/app/finance", req.url));
}
