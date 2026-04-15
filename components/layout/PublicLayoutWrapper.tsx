'use client';

import { usePathname } from '@/lib/routing';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

interface PublicLayoutWrapperProps {
  children: React.ReactNode;
}

export function PublicLayoutWrapper({ children }: PublicLayoutWrapperProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.includes('/dashboard');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <FloatingWhatsApp />
      <Footer />
    </>
  );
}

