'use client';

import { useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/lib/routing';
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  CalendarDays,
  Globe,
  Users,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  locale: string;
}

const menuItems = [
  {
    title: 'Dashboard',
    titleAr: 'لوحة التحكم',
    icon: LayoutDashboard,
    href: 'dashboard',
  },
  {
    title: 'Blog',
    titleAr: 'المدونة',
    icon: BookOpen,
    href: 'dashboard/blog',
  },
  {
    title: 'Projects',
    titleAr: 'المشاريع',
    icon: FolderKanban,
    href: 'dashboard/projects',
  },
  {
    title: 'Events',
    titleAr: 'الفعاليات',
    icon: CalendarDays,
    href: 'dashboard/events',
  },
  {
    title: 'Clients',
    titleAr: 'العملاء',
    icon: Users,
    href: 'dashboard/clients',
  },
  {
    title: 'Jobs',
    titleAr: 'الوظائف',
    icon: FolderKanban,
    href: 'dashboard/jobs',
  },
  {
    title: 'Locations',
    titleAr: 'المواقع',
    icon: FolderKanban,
    href: 'dashboard/locations',
  },
  {
    title: 'Nationalities',
    titleAr: 'الجنسيات',
    icon: Globe,
    href: 'dashboard/nationalities',
  },
  {
    title: 'Contact Messages',
    titleAr: 'رسائل التواصل',
    icon: Mail,
    href: 'dashboard/contact',
  },
];

export function Sidebar({ locale }: SidebarProps) {
  const isRTL = locale === 'ar';
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLocale;
      document.documentElement.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
    }
  }, [currentLocale]);

  const toggleLanguage = useCallback(() => {
    const newLocale = currentLocale === 'en' ? 'ar' : 'en';
    router.replace(pathname, { locale: newLocale });
  }, [currentLocale, pathname, router]);

  return (
    <aside
      className={cn(
        'w-64 border-r bg-muted/40 p-6 flex flex-col gap-8',
        isRTL && 'border-l border-r-0'
      )}
    >
      <div
        className={cn(
          'flex items-start justify-between gap-4',
          isRTL && 'flex-row-reverse'
        )}
      >
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">SMART</h2>
          <p className="text-sm text-muted-foreground">
            {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </p>
        </div>
        <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={toggleLanguage}>
            {currentLocale === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const title = locale === 'ar' ? item.titleAr : item.title;
          return (
            <Link
              key={item.href}
              href={`/${item.href}`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span>{title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

