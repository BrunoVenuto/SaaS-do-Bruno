import Link from "next/link";

export default function Fail({ searchParams }: { searchParams: { reason?: string } }) {
  const reason = searchParams?.reason || "unknown";
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-xl card text-center">
        <h1 className="text-2xl font-extrabold">Não foi possível agendar</h1>
        <p className="mt-2 text-white/70">
          Motivo: {reason === "overlap" ? "horário indisponível" : reason}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link className="btn btn-primary" href="/book/demo">Tentar novamente</Link>
          <Link className="btn btn-ghost" href="/">Home</Link>
        </div>
      </div>
    </div>
  );
}
