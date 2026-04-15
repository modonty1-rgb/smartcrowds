'use client';

import Image from 'next/image';
import whatsappSvg from '@/components/icons/whatsapp.svg';

export function FloatingWhatsApp() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  const href = `https://wa.me/${number}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-6 right-6 z-50 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 p-3"
    >
      <Image src={whatsappSvg} alt="WhatsApp" width={24} height={24} />
    </a>
  );
}














