import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AppHome() {
  const session = await getAuthSession();
  const email = session?.user?.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { tenant: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Área do Sistema</h1>
        <form action="/api/app/logout" method="post">
          <button className="btn btn-ghost" type="submit">Sair</button>
        </form>
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-lg font-bold">Selecione a barbearia</div>
            <div className="text-sm text-white/70">Define o tenant ativo via cookie.</div>
          </div>
          <div className="badge">multi-tenant</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {memberships.map((m) => (
            <div key={m.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
              <form action="/api/app/set-tenant" method="post">
                <input type="hidden" name="tenantId" value={m.tenantId} />
                <button className="btn btn-primary" type="submit">{m.tenant.name}</button>
              </form>
              <Link href={`/book/${m.tenantId}`} target="_blank" className="btn btn-ghost text-xs" title="Ver página pública">
                🔗 Ver Página
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link className="card hover:border-brand-yellow/40 transition" href="/app/admin/services">
          <div className="text-lg font-bold">Serviços</div>
          <div className="text-sm text-white/70">Gerenciar preços e duração</div>
        </Link>
        <Link className="card hover:border-brand-yellow/40 transition" href="/app/admin/professionals">
          <div className="text-lg font-bold">Profissionais</div>
          <div className="text-sm text-white/70">Equipe e comissões</div>
        </Link>
        <Link className="card hover:border-brand-yellow/40 transition" href="/app/agenda">
          <div className="text-lg font-bold">Agenda</div>
          <div className="text-sm text-white/70">Criar/cancelar agendamentos</div>
        </Link>
        <Link className="card hover:border-brand-yellow/40 transition" href="/app/barber">
          <div className="text-lg font-bold">Barbeiro</div>
          <div className="text-sm text-white/70">Próximos cortes + comissão</div>
        </Link>
        <Link className="card hover:border-brand-yellow/40 transition" href="/app/finance">
          <div className="text-lg font-bold">Financeiro</div>
          <div className="text-sm text-white/70">Receitas/despesas + comissão</div>
        </Link>
        <Link className="card hover:border-brand-yellow/40 transition" href="/app/crm">
          <div className="text-lg font-bold">CRM</div>
          <div className="text-sm text-white/70">Histórico + reativação</div>
        </Link>
        <Link className="card hover:border-brand-yellow/40 transition" href="/app/settings">
          <div className="text-lg font-bold">Configurações</div>
          <div className="text-sm text-white/70">Dados da Barbearia</div>
        </Link>
      </div>
    </div>
  );
}
