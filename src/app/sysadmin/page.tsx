
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TenantActions from "./TenantActions";

export default async function SysAdminPage() {
    const session = await getAuthSession();

    const email = session?.user?.email;

    if (!email) return redirect("/auth/login");

    console.log("SysAdmin Page - Logged User:", email);

    // Verificação manual de isSuperAdmin, pois o tipo pode não estar atualizado no cliente ainda
    // Podemos consultar o usuário diretamente para ter certeza e segurança
    // Usamos queryRaw para garantir que o campo venha do banco mesmo se o client estiver desatualizado
    const users: any[] = await prisma.$queryRaw`SELECT "isSuperAdmin" FROM "User" WHERE email = ${email} LIMIT 1`;
    console.log("SysAdmin Page - Query Result:", users);

    const user = users[0];

    // @ts-ignore - isSuperAdmin pode não estar na definição de tipo ainda
    if (!user?.isSuperAdmin) {
        return (
            <div className="flex h-screen items-center justify-center">
                <h1 className="text-2xl font-bold">Acesso Negado</h1>
            </div>
        )
    }

    // Usar query bruta para garantir que pegamos o campo isActive mesmo se o Prisma Client estiver desatualizado
    const tenants: any[] = await prisma.$queryRaw`
        SELECT 
            t.id, 
            t.name, 
            t."createdAt", 
            t."isActive", 
            (SELECT COUNT(*) FROM "Appointment" a WHERE a."tenantId" = t.id)::int as appointment_count,
            (SELECT COUNT(*) FROM "Customer" c WHERE c."tenantId" = t.id)::int as customer_count
        FROM "Tenant" t 
        ORDER BY t."createdAt" DESC
    `;

    // Dados Financeiros Simulados - Assumindo R$ 39,90/mês por barbearia ativa
    const activeTenantsCount = tenants.filter((t: any) => t.isActive).length;
    const mrr = activeTenantsCount * 39.90;

    console.log("Dados das Barbearias:", JSON.stringify(tenants, null, 2));

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold">Super Admin do SaaS</h1>
                    <p className="text-white/70">Visão geral do negócio BarberSaaS.</p>
                </div>
                <Link href="/app" className="btn btn-ghost">Voltar para App</Link>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <div className="card border-brand-yellow/20 bg-brand-yellow/5">
                    <div className="text-sm text-brand-yellow font-bold uppercase tracking-wider">MRR Estimado</div>
                    <div className="text-3xl font-extrabold mt-2">R$ {mrr.toFixed(2).replace('.', ',')}</div>
                    <div className="text-xs text-white/50 mt-1">Base: R$ 39,90 / barbearia</div>
                </div>
                <div className="card">
                    <div className="text-sm text-white/70 font-bold uppercase tracking-wider">Total Barbearias</div>
                    <div className="text-3xl font-extrabold mt-2">{activeTenantsCount}</div>
                </div>
                <div className="card">
                    <div className="text-sm text-white/70 font-bold uppercase tracking-wider">Novas (Mês)</div>
                    <div className="text-3xl font-extrabold mt-2">
                        {tenants.filter((t: any) => new Date(t.createdAt).getMonth() === new Date().getMonth()).length}
                    </div>
                </div>
            </div>

            {/* Tenants List */}
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Barbearias Cadastradas</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-white/50 border-b border-white/10">
                            <tr>
                                <th className="pb-2">Nome</th>
                                <th className="pb-2">ID</th>
                                <th className="pb-2">Criado em</th>
                                <th className="pb-2 text-right">Agendamentos</th>
                                <th className="pb-2 text-right">Clientes</th>
                                <th className="pb-2 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tenants.map(t => (
                                <tr key={t.id} className="hover:bg-white/5 transition">
                                    <td className="py-3 font-semibold">{t.name}</td>
                                    <td className="py-3 text-xs font-mono text-white/50">{t.id}</td>
                                    <td className="py-3 text-white/70">{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                                    <td className="py-3 text-right">{t.appointment_count}</td>
                                    <td className="py-3 text-right">{t.customer_count}</td>
                                    <td className="py-3 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/book/${t.id}`} target="_blank" className="font-bold text-brand-yellow hover:underline text-xs">
                                                Ver Página
                                            </Link>
                                            <TenantActions tenantId={t.id} isActive={t.isActive} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
