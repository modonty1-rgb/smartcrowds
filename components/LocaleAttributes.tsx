'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

export function LocaleAttributes() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [locale, isRTL]);

  return null;
}




































