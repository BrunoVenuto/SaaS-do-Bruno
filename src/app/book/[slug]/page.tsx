
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BookingForm from "../components/BookingForm";

export default async function BookPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  const tenant = slug === "demo"
    ? await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" } })
    : await prisma.tenant.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug: slug }
        ]
      }
    });

  if (!tenant) return (
    <div className="flex min-h-screen items-center justify-center bg-brand-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Barbearia não encontrada</h1>
        <Link href="/" className="text-brand-yellow hover:underline">Voltar para Home</Link>
      </div>
    </div>
  );

  const [services, professionals] = await Promise.all([
    prisma.service.findMany({ where: { tenantId: tenant.id, isActive: true }, orderBy: { name: "asc" } }),
    prisma.professional.findMany({ where: { tenantId: tenant.id, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-brand-black text-white selection:bg-brand-yellow selection:text-brand-black">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-black/50 z-0" />
        <img
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop"
          alt="Barbershop Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full z-20 pb-10 pt-20 bg-gradient-to-t from-brand-black to-transparent">
          <div className="container">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-2">
              {tenant.name}
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl">
              Agende seu horário com os melhores profissionais. Estilo, tradição e qualidade.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12 grid gap-12 lg:grid-cols-3">
        {/* Main Content (Services & Info) */}
        <div className="lg:col-span-2 space-y-12">

          {/* Services Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-brand-yellow">///</span> Nossos Serviços
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map(s => (
                <div key={s.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 hover:border-brand-yellow/50 transition duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{s.name}</h3>
                    <div className="text-brand-yellow font-mono font-bold">
                      R$ {(s.priceCents / 100).toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                  <div className="text-sm text-white/50 flex items-center gap-2">
                    <span>⏱ {s.durationMin} minutos</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-brand-yellow">///</span> Sobre a Barbearia
            </h2>
            <div className="prose prose-invert text-white/70">
              <p>
                Bem-vindo à {tenant.name}. Somos especialistas em cortes modernos e clássicos, barboterapia e cuidados masculinos.
                Nosso ambiente foi preparado para você relaxar e sair com o visual renovado.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">

                {tenant.address && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-white/10 flex items-center justify-center text-xl">📍</div>
                    <div>
                      <div className="font-bold text-white">Localização</div>
                      <div className="text-sm">{tenant.address}</div>
                    </div>
                  </div>
                )}

                {tenant.phone && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-white/10 flex items-center justify-center text-xl">📞</div>
                    <div>
                      <div className="font-bold text-white">Contato</div>
                      <div className="text-sm">{tenant.phone}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-white/10 flex items-center justify-center text-xl">🕒</div>
                  <div>
                    <div className="font-bold text-white">Horário</div>
                    <div className="text-sm">Seg - Sáb: 09h às 20h</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar (Booking Form) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-1">Agendar Horário</h3>
              <p className="text-sm text-white/50 mb-6">Preencha para garantir sua vaga.</p>

              <BookingForm
                tenantId={tenant.id}
                services={services}
                professionals={professionals}
              />

              <div className="mt-6 text-center">
                <div className="text-xs text-white/30">Powered by BarberSaaS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
