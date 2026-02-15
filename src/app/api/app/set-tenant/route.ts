import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getAuthSession();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const form = await req.formData();
  const tenantId = String(form.get("tenantId") || "");

  const membership = await prisma.membership.findUnique({
    where: { tenantId_userId: { tenantId, userId: user.id } },
  });

  if (!membership) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const res = NextResponse.redirect(new URL("/app/agenda", req.url));
  res.cookies.set("x-tenant-id", tenantId, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
