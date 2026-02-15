
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function BookingForm({ tenantId, services, professionals }: { tenantId: string, services: any[], professionals: any[] }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        serviceId: "",
        professionalId: "",
        date: "",
        time: "",
    });
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Auto-advance logic could be added here, but keeping it manual for clarity

    useEffect(() => {
        if (formData.serviceId && formData.professionalId && formData.date) {
            fetchSlots();
        }
    }, [formData.serviceId, formData.professionalId, formData.date]);

    async function fetchSlots() {
        setLoadingSlots(true);
        setSlots([]);
        try {
            const params = new URLSearchParams({
                professionalId: formData.professionalId,
                serviceId: formData.serviceId,
                date: formData.date,
            });
            const res = await fetch(`/api/book/slots?${params}`);
            const data = await res.json();
            if (data.slots) {
                setSlots(data.slots);
            }
        } catch (error) {
            console.error("Error fetching slots", error);
        } finally {
            setLoadingSlots(false);
        }
    }

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSlotSelect = (time: string) => {
        setFormData({ ...formData, time });
    };

    return (
        <form action="/api/book/create" method="post" className="space-y-4">
            <input type="hidden" name="tenantId" value={tenantId} />
            {/* Hidden inputs to submit properly */}
            <input type="hidden" name="startAt" value={formData.date && formData.time ? `${formData.date}T${formData.time}` : ""} />

            <div>
                <label className="text-xs font-semibold text-white/60 mb-1 block uppercase tracking-wider">Seus Dados</label>
                <input
                    className="input w-full"
                    name="customerName"
                    placeholder="Nome completo"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                />
                <input
                    className="input mt-2 w-full"
                    name="customerPhone"
                    placeholder="WhatsApp (31) 9..."
                    required
                    value={formData.customerPhone}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label className="text-xs font-semibold text-white/60 mb-1 block uppercase tracking-wider">Serviço</label>
                <select
                    className="input appearance-none w-full"
                    name="serviceId"
                    required
                    value={formData.serviceId}
                    onChange={handleChange}
                >
                    <option value="" disabled>Selecione um serviço</option>
                    {services.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name} - R$ {(s.priceCents / 100).toFixed(0)}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-xs font-semibold text-white/60 mb-1 block uppercase tracking-wider">Profissional</label>
                <select
                    className="input appearance-none w-full"
                    name="professionalId"
                    required
                    value={formData.professionalId}
                    onChange={handleChange}
                >
                    <option value="" disabled>Selecione o barbeiro</option>
                    {professionals.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            <div>
                <label className="text-xs font-semibold text-white/60 mb-1 block uppercase tracking-wider">Data</label>
                <input
                    className="input w-full"
                    type="date"
                    name="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.date}
                    onChange={handleChange}
                />
            </div>

            {/* Slots Grid */}
            {formData.date && formData.professionalId && formData.serviceId && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="text-xs font-semibold text-white/60 mb-1 block uppercase tracking-wider">
                        Horários Disponíveis ({slots.length})
                    </label>

                    {loadingSlots ? (
                        <div className="text-center py-4 text-white/50 text-sm">Buscando horários...</div>
                    ) : slots.length === 0 ? (
                        <div className="text-center py-4 text-red-400 text-sm bg-red-400/10 rounded-lg border border-red-400/20">
                            Sem horários disponíveis para esta data.
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 customer-scrollbar">
                            {slots.map(slot => (
                                <button
                                    type="button"
                                    key={slot}
                                    onClick={() => handleSlotSelect(slot)}
                                    className={`
                                    py-2 px-1 text-sm font-medium rounded-md transition-all
                                    ${formData.time === slot
                                            ? 'bg-brand-yellow text-brand-black shadow-lg shadow-brand-yellow/20 translate-y-[-1px]'
                                            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}
                                `}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <button
                className="btn btn-primary w-full py-3 text-lg shadow-lg hover:shadow-brand-yellow/20 mt-4"
                type="submit"
                disabled={!formData.time || !formData.date || !formData.serviceId || !formData.professionalId}
            >
                Confirmar Agendamento
            </button>
        </form>
    );
}
