"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TenantActions({ tenantId, isActive }: { tenantId: string, isActive: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleDeactivate() {
        if (!confirm("Tem certeza que deseja desativar esta barbearia? O acesso será bloqueado.")) return;
        setLoading(true);
        try {
            await fetch("/api/sysadmin/tenants", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenantId, isActive: false }),
            });
            router.refresh();
        } catch (error) {
            alert("Erro ao desativar.");
        } finally {
            setLoading(false);
        }
    }

    async function handleGenericPatch(active: boolean) {
        setLoading(true);
        try {
            await fetch("/api/sysadmin/tenants", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenantId, isActive: active }),
            });
            router.refresh();
        } catch (error) {
            alert("Erro ao atualizar.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!confirm("ATENÇÃO: Isso excluirá permanentemente a barbearia e todos os dados associados. Continuar?")) return;
        setLoading(true);
        try {
            await fetch("/api/sysadmin/tenants", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenantId }),
            });
            router.refresh();
        } catch (error) {
            alert("Erro ao excluir.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex gap-2 justify-end">
            <button
                onClick={() => handleGenericPatch(true)}
                disabled={loading || isActive}
                className={`btn btn-ghost text-xs ${isActive ? 'text-white/20 cursor-not-allowed' : 'text-green-400 hover:bg-green-400/10 hover:text-green-300'}`}
            >
                {loading && !isActive ? "..." : "Ativar"}
            </button>

            <button
                onClick={handleDeactivate}
                disabled={loading || !isActive}
                className={`btn btn-ghost text-xs ${!isActive ? 'text-white/20 cursor-not-allowed' : 'text-red-400 hover:bg-red-400/10 hover:text-red-300'}`}
            >
                {loading && isActive ? "..." : "Desativar"}
            </button>

            <button
                onClick={handleDelete}
                disabled={loading}
                className="btn btn-ghost text-xs text-white/30 hover:bg-red-900/20 hover:text-red-500"
            >
                {loading ? "..." : "🗑️"}
            </button>
        </div>
    );
}
