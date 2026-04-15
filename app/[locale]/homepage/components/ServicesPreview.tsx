'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/routing';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Car,
  Users,
  Shield,
  ClipboardCheck,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

const serviceIcons = {
  'traffic-control': Car,
  guidance: Users,
  security: Shield,
  'strategic-planning': ClipboardCheck,
  'crowd-management': TrendingUp,
  'personal-protection': UserCheck,
} as const;

const translationKeyMap = {
  'traffic-control': 'trafficControl',
  guidance: 'guidance',
  security: 'security',
  'strategic-planning': 'strategicPlanning',
  'crowd-management': 'crowdManagement',
  'personal-protection': 'personalProtection',
} as const;

export function ServicesPreview() {
  const t = useTranslations('services');
  const tCommon = useTranslations('common.cta');
  const locale = useLocale();

  const services = [
    'traffic-control',
    'guidance',
    'security',
    'strategic-planning',
    'crowd-management',
    'personal-protection',
  ] as const;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h2>
          <p className="text-xl text-muted-foreground">
            {locale === 'ar'
              ? 'حلول شاملة لتنظيم الفعاليات'
              : 'Comprehensive solutions for event organization'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = serviceIcons[service];
            return (
              <motion.div
                key={service}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  href={{ pathname: '/services', hash: service }}
                  locale={locale}
                  className="block h-full"
                >
                  <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-1 border-2 hover:border-accent/50 group">
                    <CardHeader className="text-center flex flex-col items-center gap-3">
                      <div className="inline-flex p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <Icon className="h-10 w-10 text-accent" />
                      </div>
                      <CardTitle className="group-hover:text-accent transition-colors">
                        {t(`items.${translationKeyMap[service]}.title`)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                      <CardDescription className="leading-relaxed text-center">
                        {t(`items.${translationKeyMap[service]}.description`)}
                      </CardDescription>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                        {tCommon('learnMore')}
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/services">{tCommon('viewAll')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

