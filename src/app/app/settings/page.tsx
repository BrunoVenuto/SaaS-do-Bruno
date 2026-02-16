
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/activeTenant";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
    const session = await getAuthSession();
    const email = session?.user?.email;
    if (!email) return redirect("/auth/login");

    const activeTenantId = getActiveTenantId();
    if (!activeTenantId) return redirect("/app");

    // Check if user is owner/admin of this tenant
    const user = await prisma.user.findUnique({
        where: { email },
        include: { memberships: true }
    });

    if (!user) return redirect("/auth/login");

    const membership = user.memberships.find(m => m.tenantId === activeTenantId);
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
        return (
            <div className="container py-10">
                <h1 className="text-2xl font-bold">Acesso Negado</h1>
                <p>Apenas administradores podem acessar esta página.</p>
            </div>
        );
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id: activeTenantId }
    });

    if (!tenant) return redirect("/app");

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-extrabold mb-6">Configurações da Barbearia</h1>

            <div className="card max-w-2xl">
                <SettingsForm
                    tenantId={tenant.id}
                    initialName={tenant.name}
                    initialSlug={tenant.slug || ""}
                    initialAddress={(tenant as any).address || ""}
                    initialPhone={(tenant as any).phone || ""}
                />
            </div>
        </div>
    );
}
