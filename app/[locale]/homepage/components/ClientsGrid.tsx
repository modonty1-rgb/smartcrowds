import { prisma } from '@/lib/prisma';
import Image from 'next/image';

interface ClientsGridProps {
  locale: string;
}

export default async function ClientsGrid({ locale }: ClientsGridProps) {
  type ClientItem = { id: string; name: string; logoUrl: string };
  const clients = (await prisma.client.findMany({
    where: { published: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })) as unknown as ClientItem[];

  if (!clients.length) return null;

  return (
    <section className="py-12">
      <h2 className="text-center text-base md:text-lg font-medium text-muted-foreground mb-6">
        {locale === 'ar' ? 'عملاؤنا' : 'Trusted by'}
      </h2>
      <p className="text-center text-sm text-muted-foreground/80 max-w-2xl mx-auto mb-8">
        {locale === 'ar'
          ? 'شركاؤنا الموثوق بهم في قطاعات مختلفة يعكسون جودة خدماتنا ودقة التنفيذ.'
          : 'Trusted partners across diverse sectors who rely on our precision and event expertise.'}
      </p>
      <div className="container mx-auto px-4 flex flex-col items-center">
        <div className="grid w-full max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 justify-items-stretch">
          {clients.map((c: ClientItem) => (
            <div
              key={c.id}
              className="group flex items-center justify-center rounded-2xl border border-border/40 bg-muted/30/80 px-4 py-6 sm:px-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)] ring-1 ring-transparent transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.12)] hover:ring-accent/30 w-full"
              title={c.name}
              aria-label={c.name}
            >
              <Image
                src={c.logoUrl}
                alt={c.name}
                width={240}
                height={120}
                sizes="(max-width: 480px) 42vw, (max-width: 768px) 30vw, (max-width: 1280px) 20vw, 160px"
                className="h-16 sm:h-20 w-full object-contain opacity-80 transition group-hover:opacity-100 group-hover:grayscale-0 grayscale"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
