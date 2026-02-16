import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/activeTenant";
import { redirect } from "next/navigation";

export default async function FinancePage() {
  const session = await getAuthSession();
  if (!session?.user?.email) return null;

  const tenantId = getActiveTenantId();
  if (!tenantId) return redirect("/app");
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  const [incomeAgg, expenseAgg, recentConfirmed, recentTx] = await Promise.all([
    prisma.transaction.aggregate({ where: { tenantId, type: "INCOME", occurredAt: { gte: start } }, _sum: { amountCents: true } }),
    prisma.transaction.aggregate({ where: { tenantId, type: "EXPENSE", occurredAt: { gte: start } }, _sum: { amountCents: true } }),
    prisma.appointment.findMany({
      where: { tenantId, status: "CONFIRMED", startAt: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } },
      include: { customer: true, professional: true, service: true },
      orderBy: { startAt: "asc" },
      take: 10,
    }),
    prisma.transaction.findMany({
      where: { tenantId, occurredAt: { gte: start } },
      orderBy: { occurredAt: "desc" },
      take: 12,
    }),
  ]);

  const income = (incomeAgg._sum.amountCents || 0) / 100;
  const expense = (expenseAgg._sum.amountCents || 0) / 100;
  const net = income - expense;

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Financeiro</h1>
        <Link className="btn btn-ghost" href="/app">Voltar</Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="card md:col-span-1">
          <div className="text-sm text-white/70">Mês atual (desde {start.toLocaleDateString("pt-BR")})</div>
          <div className="mt-3 space-y-1">
            <div><span className="text-white/70">Receitas:</span> <span className="font-semibold text-brand-yellow">R$ {income.toFixed(2).replace(".", ",")}</span></div>
            <div><span className="text-white/70">Despesas:</span> <span className="font-semibold">R$ {expense.toFixed(2).replace(".", ",")}</span></div>
            <div><span className="text-white/70">Saldo:</span> <span className="font-semibold">R$ {net.toFixed(2).replace(".", ",")}</span></div>
          </div>
        </div>

        <div className="card md:col-span-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-lg font-bold">Finalizar atendimento</div>
              <div className="text-sm text-white/70">Marca como pago → gera receita + comissão.</div>
            </div>
            <span className="badge">automático</span>
          </div>

          <div className="mt-4 divide-y divide-white/10">
            {recentConfirmed.length === 0 && <div className="text-sm text-white/70">Nenhum agendamento confirmado.</div>}
            {recentConfirmed.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold">{a.customer.name} <span className="text-white/60">— {a.service.name}</span></div>
                  <div className="text-sm text-white/70">{a.professional.name} • {new Date(a.startAt).toLocaleString("pt-BR")}</div>
                </div>
                <form action="/api/app/finance/close-appointment" method="post" className="flex items-center gap-2">
                  <input type="hidden" name="appointmentId" value={a.id} />
                  <select className="input w-auto" name="method" required defaultValue="pix">
                    <option value="pix">PIX</option>
                    <option value="cash">Dinheiro</option>
                    <option value="card">Cartão</option>
                  </select>
                  <button className="btn btn-primary" type="submit">Pago</button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">Transações recentes</div>
          <span className="badge">últimas 12</span>
        </div>

        <div className="mt-4 divide-y divide-white/10">
          {recentTx.length === 0 && <div className="text-sm text-white/70">Sem transações.</div>}
          {recentTx.map((t) => (
            <div key={t.id} className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="badge">{t.type}</span>
                <span className="font-semibold">R$ {(t.amountCents / 100).toFixed(2).replace(".", ",")}</span>
                <span className="text-sm text-white/60">• {new Date(t.occurredAt).toLocaleString("pt-BR")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
