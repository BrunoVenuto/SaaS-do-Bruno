import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Usuário Admin Principal (Bruno)
  const brunoEmail = "brunovlviana41@gmail.com";
  const brunoPassword = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: brunoEmail },
    update: { isSuperAdmin: true },
    create: {
      email: brunoEmail,
      passwordHash: brunoPassword,
      name: "Bruno SaaS Admin",
      isSuperAdmin: true
    },
  });

  // Usuário Demo antigo (mantido por compatibilidade)
  const email = "admin@demo.com";
  const password = "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { isSuperAdmin: true },
    create: { email, passwordHash, name: "Admin Demo", isSuperAdmin: true },
  });


  const tenant = await prisma.tenant.upsert({
    where: { slug: "barbearia-demo" },
    update: {},
    create: {
      name: "Barbearia Demo",
      slug: "barbearia-demo",
      timezone: "America/Sao_Paulo"
    },
  });

  await prisma.membership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: { role: "OWNER" },
    create: { tenantId: tenant.id, userId: user.id, role: "OWNER" },
  });


  const prof = await prisma.professional.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      name: "Admin (Barbeiro)",
      commissionType: "PERCENT",
      commissionValue: 50,
    },
  });

  const service = await prisma.service.create({
    data: { tenantId: tenant.id, name: "Corte", durationMin: 30, priceCents: 5000 },
  });

  const customer = await prisma.customer.create({
    data: { tenantId: tenant.id, name: "Cliente Teste", phone: "+5511999999999", notes: "Gosta de degradê." },
  });

  const start = new Date();
  start.setHours(start.getHours() + 2);
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      professionalId: prof.id,
      serviceId: service.id,
      startAt: start,
      endAt: end,
      status: "CONFIRMED",
      source: "internal",
    },
  });

  console.log("Seed OK:");
  console.log("Login:", email, password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
