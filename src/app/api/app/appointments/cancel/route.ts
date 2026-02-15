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

  await prisma.appointment.updateMany({
    where: { id: appointmentId, tenantId },
    data: { status: "CANCELLED" },
  });

  return NextResponse.redirect(new URL("/app/agenda", req.url));
}
