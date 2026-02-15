"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Professional {
    id: string;
    name: string;
    phone: string | null;
    commissionType: string;
    commissionValue: number;
    isActive: boolean;
}

export default function ProfessionalsManager({ initialProfessionals }: { initialProfessionals: Professional[] }) {
    const router = useRouter();
    const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [commissionType, setCommissionType] = useState("PERCENT");
    const [commissionValue, setCommissionValue] = useState(50);

    async function toggleProfessional(formData: FormData) {
        const id = formData.get("id") as string;
        const isActive = formData.get("isActive") === "true";

        await fetch("/api/admin/professionals", {
            method: "PATCH",
            body: JSON.stringify({ id, isActive }),
            headers: { "Content-Type": "application/json" }
        });
        router.refresh();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/professionals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, commissionType, commissionValue }),
            });

            if (!res.ok) throw new Error("Erro ao criar profissional");

            const newProf = await res.json();
            setProfessionals([...professionals, newProf]);
            setName("");
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
                <h2 className="text-xl font-bold mb-4">Novo Profissional</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-xs text-white/70">Nome</label>
                        <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: João Silva" />
                    </div>
                    <div>
                        <label className="text-xs text-white/70">WhatsApp</label>
                        <input className="input mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(31) 9..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-white/70">Tipo Comissão</label>
                            <select className="input mt-1" value={commissionType} onChange={(e) => setCommissionType(e.target.value)}>
                                <option value="PERCENT">Porcentagem (%)</option>
                                <option value="FIXED">Fixo (R$)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-white/70">Valor</label>
                            <input type="number" className="input mt-1" value={commissionValue} onChange={(e) => setCommissionValue(Number(e.target.value))} required />
                        </div>
                    </div>
                    <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                        {loading ? "Salvando..." : "Adicionar Profissional"}
                    </button>
                    {error && <div className="text-sm text-red-400">{error}</div>}
                </form>
            </div>

            <div className="card">
                <h2 className="text-xl font-bold mb-4">Profissionais</h2>
                <div className="space-y-2">
                    {professionals.length === 0 && <p className="text-white/50 text-sm">Nenhum profissional cadastrado.</p>}
                    {professionals.map(p => (
                        <div key={p.id} className="p-3 border border-white/10 rounded flex justify-between items-center">
                            <div>
                                <div className="font-semibold">{p.name}</div>
                                <div className="text-xs text-white/60">
                                    Comissão: {p.commissionValue} {p.commissionType === "PERCENT" ? "%" : "R$"}
                                    {p.phone && <span className="block text-white/40">{p.phone}</span>}
                                </div>
                            </div>
                            <div className="py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                    <Link href={`/app/admin/professionals/${p.id}/availability`} className="btn btn-ghost text-xs">
                                        🕑 Horários
                                    </Link>
                                    <form action={toggleProfessional}>
                                        <input type="hidden" name="id" value={p.id} />
                                        <input type="hidden" name="isActive" value={(!p.isActive).toString()} />
                                        <button className={`btn btn-sm ${p.isActive ? 'btn-ghost text-red-400' : 'btn-ghost text-green-400'}`}>
                                            {p.isActive ? 'Desativar' : 'Ativar'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
