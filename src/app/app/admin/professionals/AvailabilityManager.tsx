
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DAYS = [
    { value: "MONDAY", label: "Segunda" },
    { value: "TUESDAY", label: "Terça" },
    { value: "WEDNESDAY", label: "Quarta" },
    { value: "THURSDAY", label: "Quinta" },
    { value: "FRIDAY", label: "Sexta" },
    { value: "SATURDAY", label: "Sábado" },
    { value: "SUNDAY", label: "Domingo" },
];

export default function AvailabilityManager({ professionalId, initialAvailability }: { professionalId: string, initialAvailability: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState<any[]>(initialAvailability || []);

    const handleDayToggle = (day: string) => {
        const existing = availability.find(a => a.dayOfWeek === day);
        if (existing) {
            setAvailability(availability.filter(a => a.dayOfWeek !== day));
        } else {
            setAvailability([...availability, { dayOfWeek: day, startTime: "09:00", endTime: "18:00", breakStart: "", breakEnd: "" }]);
        }
    };

    const handleChange = (day: string, field: string, value: string) => {
        setAvailability(availability.map(a => a.dayOfWeek === day ? { ...a, [field]: value } : a));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/professionals/${professionalId}/availability`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ availability }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Erro ao salvar horários.");
            }

            alert("Horários salvos com sucesso!");
            router.refresh();
        } catch (error: any) {
            console.error("Save availability error:", error);
            alert(error.message || "Erro ao salvar horários.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="card">
            <h2 className="text-xl font-bold mb-4">Horários de Atendimento</h2>
            <div className="space-y-4">
                {DAYS.map((day) => {
                    const config = availability.find(a => a.dayOfWeek === day.value);
                    const isSelected = !!config;

                    return (
                        <div key={day.value} className={`p-4 rounded-lg border ${isSelected ? 'border-brand-yellow/50 bg-brand-yellow/5' : 'border-white/5 bg-white/5'}`}>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleDayToggle(day.value)}
                                    className="checkbox checkbox-primary"
                                />
                                <span className="font-bold w-24">{day.label}</span>

                                {isSelected && (
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <input
                                            type="time"
                                            value={config.startTime}
                                            onChange={(e) => handleChange(day.value, 'startTime', e.target.value)}
                                            className="input input-sm border-white/20"
                                        />
                                        <span>até</span>
                                        <input
                                            type="time"
                                            value={config.endTime}
                                            onChange={(e) => handleChange(day.value, 'endTime', e.target.value)}
                                            className="input input-sm border-white/20"
                                        />

                                        <div className="ml-4 flex items-center gap-2 text-sm text-white/50">
                                            <span>Pausa:</span>
                                            <input
                                                type="time"
                                                value={config.breakStart || ""}
                                                onChange={(e) => handleChange(day.value, 'breakStart', e.target.value)}
                                                className="input input-xs border-white/10 w-20"
                                            />
                                            <span>-</span>
                                            <input
                                                type="time"
                                                value={config.breakEnd || ""}
                                                onChange={(e) => handleChange(day.value, 'breakEnd', e.target.value)}
                                                className="input input-xs border-white/10 w-20"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary"
                >
                    {loading ? "Salvando..." : "Salvar Horários"}
                </button>
            </div>
        </div>
    );
}
