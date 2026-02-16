import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { getActiveTenantId } from "@/lib/activeTenant";
import { redirect } from "next/navigation";

export default async function AgendaPage() {
  const session = await getAuthSession();
  if (!session?.user?.email) return null;

  const tenantId = getActiveTenantId();
  if (!tenantId) return redirect("/app");

  const [professionals, services, upcoming] = await Promise.all([
    prisma.professional.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.appointment.findMany({
      where: { tenantId, startAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }, status: "CONFIRMED" },
      include: { customer: true, professional: true, service: true },
      orderBy: { startAt: "asc" },
      take: 20,
    }),
  ]);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Agenda</h1>
        <Link className="btn btn-ghost" href="/app">Voltar</Link>
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-lg font-bold">Novo agendamento</div>
            <div className="text-sm text-white/70">Cria cliente na hora (telefone é identificador).</div>
          </div>
          <div className="badge">anti-overlap</div>
        </div>

        <form action="/api/app/appointments/create" method="post" className="mt-4 grid gap-3 md:grid-cols-6">
          <input className="input md:col-span-2" name="customerName" placeholder="Nome do cliente" required />
          <input className="input md:col-span-2" name="customerPhone" placeholder="Telefone +55..." required />
          <select className="input md:col-span-1" name="professionalId" required defaultValue="">
            <option value="" disabled>Barbeiro</option>
            {professionals.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="input md:col-span-1" name="serviceId" required defaultValue="">
            <option value="" disabled>Serviço</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.durationMin}m)</option>)}
          </select>

          <input className="input md:col-span-2" type="datetime-local" name="startAt" required />
          <button className="btn btn-primary md:col-span-4" type="submit">Criar</button>
        </form>
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-lg font-bold">Próximos agendamentos</div>
            <div className="text-sm text-white/70">Até 20 registros (ordenado por data).</div>
          </div>
          <Link className="btn btn-ghost" href="/book/demo">Link público</Link>
        </div>

        <div className="mt-4 divide-y divide-white/10">
          {upcoming.length === 0 && <div className="text-sm text-white/70">Nenhum agendamento.</div>}
          {upcoming.map((a) => (
            <div key={a.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-semibold">{a.customer.name} <span className="text-white/60">— {a.service.name}</span></div>
                <div className="text-sm text-white/70">
                  {a.professional.name} • {new Date(a.startAt).toLocaleString("pt-BR")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {a.customer.phone && (
                  <Link
                    href={`https://wa.me/55${a.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${a.customer.name}, confirmando seu agendamento para ${new Date(a.startAt).toLocaleString("pt-BR")} com ${a.professional.name}.`)}`}
                    target="_blank"
                    className="btn btn-ghost text-green-400 btn-sm"
                    title="Enviar WhatsApp"
                  >
                    📱 Whats
                  </Link>
                )}
                <form action="/api/app/appointments/cancel" method="post">
                  <input type="hidden" name="appointmentId" value={a.id} />
                  <button className="btn btn-ghost btn-sm text-red-400" type="submit">Cancelar</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
