
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AvailabilityManager from "../../AvailabilityManager";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function AvailabilityPage({ params }: { params: { id: string } }) {
    const session = await getAuthSession();
    if (!session?.user) return redirect("/auth/login");

    const professional = await prisma.professional.findUnique({
        where: { id: params.id },
        include: {
            // @ts-ignore
            availability: true,
            tenant: true,
        }
    });

    if (!professional) return notFound();

    // Security Check: Only allow if user is owner of the tenant
    const userMembership = await prisma.membership.findUnique({
        where: {
            tenantId_userId: {
                tenantId: professional.tenantId,
                userId: (session.user as any).id,
            }
        }
    });

    if (!userMembership) return redirect("/app");

    return (
        <div className="container py-10">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/app/admin/professionals" className="btn btn-ghost">← Voltar</Link>
                <div>
                    <h1 className="text-2xl font-bold">Horários de {professional.name}</h1>
                    <p className="text-white/70">Defina os dias e horários de trabalho.</p>
                </div>
            </div>

            {/* @ts-ignore */}
            <AvailabilityManager professionalId={professional.id} initialAvailability={professional.availability} />
        </div>
    );
}
