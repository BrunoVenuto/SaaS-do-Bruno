
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/activeTenant";
import Link from "next/link";
import ProfessionalsManager from "./ProfessionalsManager";

export default async function ProfessionalsPage() {
    const session = await getAuthSession();
    const tenantId = getActiveTenantId();

    if (!session || !tenantId) return <div>Selecione uma barbearia primeiro. <Link href="/app" className="underline">Voltar</Link></div>;

    const professionals = await prisma.professional.findMany({
        where: { tenantId },
        orderBy: { name: "asc" },
    });

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-extrabold">Gerenciar Profissionais</h1>
                <Link className="btn btn-ghost" href="/app">Voltar</Link>
            </div>
            <ProfessionalsManager initialProfessionals={professionals} />
        </div>
    );
}
