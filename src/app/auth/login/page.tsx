"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/app";

  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (res?.error) setError("Email ou senha inválidos.");
    else router.push(callbackUrl);
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-md card">
        <h1 className="text-2xl font-extrabold">
          Entrar no <span className="text-brand-yellow">BarberSaaS</span>
        </h1>
        <p className="mt-1 text-white/70 text-sm">Use o usuário demo do seed para testar.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-xs text-white/70">Email</label>
            <input className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-white/70">Senha</label>
            <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button className="btn btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {error && <div className="text-sm text-red-400">{error}</div>}
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-white/70">
          <Link href="/" className="text-brand-yellow hover:underline">Voltar</Link>
          <Link href="/auth/register" className="text-brand-yellow hover:underline">Criar nova conta</Link>
        </div>
      </div>
    </div>
  );
}
