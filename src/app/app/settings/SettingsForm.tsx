
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
    tenantId: string;
    initialName: string;
    initialAddress: string;
    initialPhone: string;
}

export default function SettingsForm({ tenantId, initialName, initialAddress, initialPhone }: SettingsFormProps) {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [address, setAddress] = useState(initialAddress);
    const [phone, setPhone] = useState(initialPhone);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/settings/tenant", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenantId, name, address, phone }),
            });

            if (!res.ok) throw new Error("Erro ao atualizar.");

            setMessage({ type: "success", text: "Dados atualizados com sucesso!" });
            router.refresh();
        } catch (error) {
            setMessage({ type: "error", text: "Erro ao atualizar os dados." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-bold text-white/70">Nome da Barbearia</label>
                <input
                    className="input mt-1 w-full"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="text-sm font-bold text-white/70">Endereço</label>
                <input
                    className="input mt-1 w-full"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Ex: Av. Brasil, 1500"
                />
            </div>

            <div>
                <label className="text-sm font-bold text-white/70">Telefone Comercial</label>
                <input
                    className="input mt-1 w-full"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                />
            </div>

            <div className="pt-4">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
            </div>

            {message && (
                <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {message.text}
                </div>
            )}
        </form>
    );
}
