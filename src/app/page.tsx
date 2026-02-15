import Link from "next/link";

export default function Home() {
  return (
    <div className="container py-10">
      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Barber<span className="text-brand-yellow">SaaS</span>
            </h1>
            <p className="mt-1 text-white/70">
              MVP pronto: multi-tenant, agenda, financeiro, CRM e worker (WhatsApp mock).
            </p>
          </div>
          <div className="flex gap-3">
            <Link className="btn btn-primary" href="/auth/login">Entrar</Link>
            <Link className="btn btn-ghost" href="/auth/register">Criar conta</Link>
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <Link className="text-sm text-brand-yellow hover:underline" href="/book/demo">Ver página de agendamento (demo)</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70">Demo (seed)</div>
          <div className="mt-2 font-mono text-sm">admin@demo.com</div>
          <div className="font-mono text-sm">admin123</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70">Tema</div>
          <div className="mt-2 text-sm">Preto • Amarelo • Dourado</div>
          <div className="mt-1 text-xs text-white/60">Tailwind configurado</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70">Infra</div>
          <div className="mt-2 text-sm">Postgres + Redis via Docker</div>
        </div>
      </div>
    </div>

  );
}
