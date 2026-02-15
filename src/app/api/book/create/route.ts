import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { fromZonedTime } from "date-fns-tz";

export async function POST(req: Request) {
  const form = await req.formData();

  const tenantId = String(form.get("tenantId") || "");
  const customerName = String(form.get("customerName") || "").trim();
  const customerPhone = String(form.get("customerPhone") || "").trim();
  const professionalId = String(form.get("professionalId") || "");
  const serviceId = String(form.get("serviceId") || "");
  const startAtStr = String(form.get("startAt") || "");

  if (!tenantId || !customerName || !customerPhone || !professionalId || !serviceId || !startAtStr) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, tenantId },
    include: { tenant: true }
  });
  if (!service) return NextResponse.json({ error: "SERVICE_NOT_FOUND" }, { status: 404 });

  const timezone = service.tenant.timezone || "America/Sao_Paulo";
  // Parse floating time (YYYY-MM-DDTHH:mm) as implied timezone time -> UTC
  const startAt = fromZonedTime(startAtStr, timezone);
  const endAt = new Date(startAt.getTime() + service.durationMin * 60 * 1000);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { tenantId_phone: { tenantId, phone: customerPhone } },
        update: { name: customerName },
        create: { tenantId, name: customerName, phone: customerPhone },
      });

      const overlap = await tx.appointment.findFirst({
        where: {
          tenantId,
          professionalId,
          status: "CONFIRMED",
          NOT: [{ endAt: { lte: startAt } }, { startAt: { gte: endAt } }],
        },
        select: { id: true },
      });

      if (overlap) throw new Error("OVERLAP");

      const appointment = await tx.appointment.create({
        data: {
          tenantId,
          customerId: customer.id,
          professionalId,
          serviceId,
          startAt,
          endAt,
          status: "CONFIRMED",
          source: "online",
        },
      });
      return appointment;
    });

    // @ts-ignore
    return NextResponse.redirect(new URL(`/book/success?id=${result.id}`, req.url));
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("OVERLAP")) return NextResponse.redirect(new URL(`/book/fail?reason=overlap`, req.url));
    return NextResponse.json({ error: "INTERNAL_ERROR", detail: msg }, { status: 500 });
  }
}
