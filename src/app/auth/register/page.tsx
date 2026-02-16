"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    // Barbershop Details
    const [barbershopName, setBarbershopName] = useState("");
    const [barbershopAddress, setBarbershopAddress] = useState("");
    const [barbershopPhone, setBarbershopPhone] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    phone,
                    barbershopName,
                    barbershopAddress,
                    barbershopPhone,
                    email,
                    password
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao criar conta.");
            }

            // Auto-login after registration
            const loginRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl: "/app",
            });

            if (loginRes?.error) {
                // Should not happen if registration worked, but just in case
                router.push("/auth/login");
            } else {
                router.push("/app");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container py-10">
            <div className="mx-auto max-w-md card">
                <h1 className="text-2xl font-extrabold">
                    Criar conta no <span className="text-brand-yellow">BarberSaaS</span>
                </h1>
                <p className="mt-1 text-white/70 text-sm">Comece a gerenciar sua barbearia hoje.</p>

                <form onSubmit={onSubmit} className="mt-6 space-y-3">
                    <div>
                        <label className="text-xs text-white/70">Seu Nome</label>
                        <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div>
                        <label className="text-xs text-white/70">Seu WhatsApp</label>
                        <input className="input mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(31) 9..." required />
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <label className="text-xs text-brand-yellow font-bold uppercase tracking-wider mb-2 block">Dados da Barbearia</label>

                        <div className="mb-3">
                            <label className="text-xs text-white/70">Nome da Barbearia</label>
                            <input className="input mt-1" value={barbershopName} onChange={(e) => setBarbershopName(e.target.value)} required />
                        </div>

                        <div className="mb-3">
                            <label className="text-xs text-white/70">Endereço da Barbearia</label>
                            <input className="input mt-1" value={barbershopAddress} onChange={(e) => setBarbershopAddress(e.target.value)} placeholder="Ex: Av. Principal, 100" />
                        </div>

                        <div className="mb-3">
                            <label className="text-xs text-white/70">Telefone da Barbearia (Comercial)</label>
                            <input className="input mt-1" value={barbershopPhone} onChange={(e) => setBarbershopPhone(e.target.value)} placeholder="(31) 3..." />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <label className="text-xs text-white/70">Email de Acesso</label>
                        <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs text-white/70">Senha</label>
                        <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <button className="btn btn-primary w-full mt-4" type="submit" disabled={loading}>
                        {loading ? "Criando conta..." : "Criar Conta"}
                    </button>

                    {error && <div className="text-sm text-red-400 text-center">{error}</div>}
                </form>

                <div className="mt-4 text-sm text-white/70">
                    Já tem conta? <Link href="/auth/login" className="text-brand-yellow hover:underline">Entrar</Link>
                </div>
            </div>
        </div>
    );
}
