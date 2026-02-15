"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Service {
    id: string;
    name: string;
    durationMin: number;
    priceCents: number;
    isActive: boolean;
}

export default function ServicesManager({ initialServices }: { initialServices: Service[] }) {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>(initialServices);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [durationMin, setDurationMin] = useState(30);
    const [price, setPrice] = useState("0,00");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const priceCents = Math.round(parseFloat(price.replace(",", ".")) * 100);

        try {
            const res = await fetch("/api/admin/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, durationMin, priceCents }),
            });

            if (!res.ok) throw new Error("Erro ao criar serviço");

            const newService = await res.json();
            setServices([...services, newService]);
            setName("");
            setPrice("0,00");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Novo Serviço</h2>
                <form onSubmit={onSubmit} className="space-y-3">
                    <div>
                        <label className="text-xs text-white/70">Nome do Serviço</label>
                        <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Corte Cabelo" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-white/70">Duração (min)</label>
                            <input type="number" className="input mt-1" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} required />
                        </div>
                        <div>
                            <label className="text-xs text-white/70">Preço (R$)</label>
                            <input className="input mt-1" value={price} onChange={(e) => setPrice(e.target.value)} required />
                        </div>
                    </div>
                    <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                        {loading ? "Salvando..." : "Adicionar Serviço"}
                    </button>
                    {error && <div className="text-sm text-red-400">{error}</div>}
                </form>
            </div>

            <div className="card">
                <h2 className="text-xl font-bold mb-4">Serviços Ativos</h2>
                <div className="space-y-2">
                    {services.length === 0 && <p className="text-white/50 text-sm">Nenhum serviço cadastrado.</p>}
                    {services.map(s => (
                        <div key={s.id} className="p-3 border border-white/10 rounded flex justify-between items-center">
                            <div>
                                <div className="font-semibold">{s.name}</div>
                                <div className="text-xs text-white/60">{s.durationMin} min</div>
                            </div>
                            <div className="font-mono text-brand-yellow">
                                R$ {(s.priceCents / 100).toFixed(2).replace(".", ",")}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
