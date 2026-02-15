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

  const customerName = String(form.get("customerName") || "").trim();
  const customerPhone = String(form.get("customerPhone") || "").trim();
  const professionalId = String(form.get("professionalId") || "");
  const serviceId = String(form.get("serviceId") || "");
  const startAtStr = String(form.get("startAt") || "");

  if (!customerName || !customerPhone || !professionalId || !serviceId || !startAtStr) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const service = await prisma.service.findFirst({ where: { id: serviceId, tenantId } });
  if (!service) return NextResponse.json({ error: "SERVICE_NOT_FOUND" }, { status: 404 });

  const startAt = new Date(startAtStr);
  const endAt = new Date(startAt.getTime() + service.durationMin * 60 * 1000);

  try {
    await prisma.$transaction(async (tx) => {
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

      await tx.appointment.create({
        data: {
          tenantId,
          customerId: customer.id,
          professionalId,
          serviceId,
          startAt,
          endAt,
          status: "CONFIRMED",
          source: "internal",
        },
      });
    });

    return NextResponse.redirect(new URL("/app/agenda", req.url));
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("OVERLAP")) return NextResponse.redirect(new URL("/app/agenda?error=overlap", req.url));
    return NextResponse.json({ error: "INTERNAL_ERROR", detail: msg }, { status: 500 });
  }
}
