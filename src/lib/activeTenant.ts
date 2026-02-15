import { cookies } from "next/headers";

export function getActiveTenantId(): string | null {
  const c = cookies().get("x-tenant-id")?.value;
  return c || null;
}
