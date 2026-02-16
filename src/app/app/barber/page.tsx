import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/activeTenant";
import { redirect } from "next/navigation";

export default async function BarberPanel() {
  const session = await getAuthSession();
  const email = session?.user?.email;
  if (!email) return null;

  const tenantId = getActiveTenantId();
  if (!tenantId) return redirect("/app");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const professional = await prisma.professional.findFirst({ where: { tenantId, userId: user.id } });

  if (!professional) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Painel do Barbeiro</h1>
          <Link className="btn btn-ghost" href="/app">Voltar</Link>
        </div>
        <div className="mt-6 card">Seu usuário não está vinculado a um profissional neste tenant.</div>
      </div>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [upcoming, commAgg] = await Promise.all([
    prisma.appointment.findMany({
      where: { tenantId, professionalId: professional.id, status: "CONFIRMED", startAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } },
      include: { customer: true, service: true },
      orderBy: { startAt: "asc" },
      take: 15,
    }),
    prisma.commission.aggregate({
      where: { tenantId, professionalId: professional.id, calculatedAt: { gte: monthStart } },
      _sum: { amountCents: true },
    }),
  ]);

  const total = (commAgg._sum.amountCents || 0) / 100;

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Painel do Barbeiro</h1>
        <Link className="btn btn-ghost" href="/app">Voltar</Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="card md:col-span-1">
          <div className="text-sm text-white/70">Comissões no mês</div>
          <div className="mt-2 text-3xl font-extrabold text-brand-yellow">
            R$ {total.toFixed(2).replace(".", ",")}
          </div>
          <div className="text-sm text-white/60">Desde {monthStart.toLocaleDateString("pt-BR")}</div>
        </div>

        <div className="card md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">Próximos cortes</div>
            <span className="badge">{professional.name}</span>
          </div>

          <div className="mt-4 divide-y divide-white/10">
            {upcoming.length === 0 && <div className="text-sm text-white/70">Nada por enquanto.</div>}
            {upcoming.map((a) => (
              <div key={a.id} className="py-3">
                <div className="font-semibold">{a.customer.name} <span className="text-white/60">— {a.service.name}</span></div>
                <div className="text-sm text-white/70">{new Date(a.startAt).toLocaleString("pt-BR")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
