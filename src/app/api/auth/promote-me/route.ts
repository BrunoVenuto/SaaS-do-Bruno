
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getAuthSession();

        if (!session?.user?.email) {
            return NextResponse.json({
                error: "Você precisa estar logado para usar esta rota de resgate."
            }, { status: 401 });
        }

        // Promover o usuário logado
        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: { isSuperAdmin: true }
        });

        return NextResponse.json({
            success: true,
            message: `Sucesso! O usuário ${user.email} agora é SuperAdmin.`,
            instruction: "Agora você pode acessar /sysadmin. Delete este arquivo após o uso por segurança."
        });
    } catch (error) {
        console.error("Rescue route error:", error);
        return NextResponse.json({ error: "Erro ao processar resgate." }, { status: 500 });
    }
}
