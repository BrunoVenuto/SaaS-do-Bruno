
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get("secret");

        // Só permite se o segredo for igual ao NEXTAUTH_SECRET (que só o Bruno sabe)
        if (!secret || secret !== process.env.NEXTAUTH_SECRET) {
            return NextResponse.json({ error: "Acesso negado. Segredo inválido." }, { status: 403 });
        }

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
