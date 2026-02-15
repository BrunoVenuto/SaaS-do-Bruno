# BarberSaaS MVP v2 (Next.js + Prisma + Tailwind)

Tema: **preto / amarelo / dourado** (Tailwind configurado em `tailwind.config.ts` e `globals.css`).

## Rodar local
1) Infra (Postgres + Redis):
```bash
docker compose up -d
```

2) App:
```bash
cp .env.example .env
npm install
npm run prisma:migrate
npm run seed
npm run dev
```

Acesse: http://localhost:3000  
Login demo: **admin@demo.com / admin123**

3) (Opcional) Worker WhatsApp (mock):
```bash
npm run worker
```

## Produção
- Configure `DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- Build:
```bash
npm run build
npm run start
```
