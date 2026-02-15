import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("x-tenant-id", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
