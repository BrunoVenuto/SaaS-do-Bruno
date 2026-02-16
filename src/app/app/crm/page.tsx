import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/activeTenant";
import { redirect } from "next/navigation";

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function CRMPage() {
  const session = await getAuthSession();
  if (!session?.user?.email) return null;

  const tenantId = getActiveTenantId();
  if (!tenantId) return redirect("/app");

  const customers = await prisma.customer.findMany({
    where: { tenantId },
    include: {
      appointments: {
        where: { status: "DONE" },
        orderBy: { startAt: "desc" },
        take: 5,
      },
    },
    take: 30,
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const reactivation = customers
    .map((c) => {
      const appts = c.appointments;
      if (appts.length < 2) return null;

      const intervals: number[] = [];
      for (let i = 0; i < appts.length - 1; i++) {
        intervals.push(daysBetween(new Date(appts[i + 1].startAt), new Date(appts[i].startAt)));
      }
      const avg = Math.max(7, Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length));
      const last = new Date(appts[0].startAt);
      const next = new Date(last.getTime() + avg * 24 * 60 * 60 * 1000);
      const dueIn = daysBetween(now, next);
      return { customer: c, avgDays: avg, next, dueIn };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.dueIn - b.dueIn)
    .slice(0, 12);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">CRM & Fidelização</h1>
        <Link className="btn btn-ghost" href="/app">Voltar</Link>
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-lg font-bold">IA leve: previsão de retorno</div>
            <div className="text-sm text-white/70">Intervalo médio entre visitas (mínimo 2 atendimentos concluídos).</div>
          </div>
          <span className="badge">reativação</span>
        </div>

        <div className="mt-4 divide-y divide-white/10">
          {reactivation.length === 0 && (
            <div className="text-sm text-white/70">Ainda não há histórico suficiente.</div>
          )}

          {reactivation.map((r: any) => (
            <div key={r.customer.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-semibold">{r.customer.name} <span className="text-white/60">({r.customer.phone})</span></div>
                <div className="text-sm text-white/70">
                  Média: {r.avgDays} dias • Próximo: {r.next.toLocaleDateString("pt-BR")} • {r.dueIn <= 0 ? "em atraso" : `em ${r.dueIn} dias`}
                </div>
              </div>
              <form action="/api/app/whatsapp/enqueue" method="post">
                <input type="hidden" name="toPhone" value={r.customer.phone} />
                <input type="hidden" name="template" value="reactivation" />
                <input type="hidden" name="customerName" value={r.customer.name} />
                <button className="btn btn-primary" type="submit">Enviar WhatsApp</button>
              </form>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">Clientes</div>
          <span className="badge">últimos 30</span>
        </div>

        <div className="mt-4 divide-y divide-white/10">
          {customers.map((c) => (
            <div key={c.id} className="py-2">
              <div className="font-semibold">{c.name} <span className="text-white/60">{c.phone}</span></div>
              <div className="text-sm text-white/70">Atendimentos concluídos: {c.appointments.length}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
