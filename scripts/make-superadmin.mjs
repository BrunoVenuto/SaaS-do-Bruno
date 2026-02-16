
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const email = process.argv[2] || 'admin@demo.com';

async function main() {
    try {
        console.log(`Promovendo ${email} para SuperAdmin...`);

        const user = await prisma.user.update({
            where: { email },
            data: { isSuperAdmin: true }
        });

        console.log('Sucesso! Usuário agora é SuperAdmin:');
        console.log(JSON.stringify(user, null, 2));
    } catch (e) {
        console.error('Erro ao promover usuário:', e.message);
        console.log('\nDICA: Verifique se o email está correto e se você rodou as migrations no banco de produção.');
    } finally {
        await prisma.$disconnect();
    }
}

main();
