'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/routing';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function Hero() {
  const t = useTranslations('home.hero');
  const tCommon = useTranslations('common.cta');
  const locale = useLocale();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background banner image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/banner.avif"
          alt="Hero background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {/* Lighter overlay for better image visibility */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="container mx-auto px-4 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="bg-background/20 backdrop-blur-sm border border-border/40 rounded-2xl p-6 md:p-10 shadow-xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-foreground mb-6">
              {t('subtitle')}
            </p>
            <p className="text-lg text-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('description')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                asChild
                size="lg"
                className="hover-lift shadow-lg"
              >
                <Link href="/contact">{tCommon('contactUs')}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 hover-lift hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Link href="/services">{tCommon('learnMore')}</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

