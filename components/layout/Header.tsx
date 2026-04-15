'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/lib/routing';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations('common.nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    window.location.href = `/${newLocale}`;
  };

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'about', href: '/about' },
    { key: 'services', href: '/services' },
    { key: 'events', href: '/events' },
    { key: 'projects', href: '/projects' },
    { key: 'blog', href: '/blog' },
    { key: 'contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      {/* Yellow accent bar at top */}
      <div className="h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            {locale === 'ar' ? (
              <>
                <span className="text-foreground text-xs font-semibold">CROWD</span>
                <span className="text-xl font-bold text-accent group-hover:text-accent/80 transition-colors">
                  SMART
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-accent group-hover:text-accent/80 transition-colors">
                  SMART
                </span>
                <span className="text-foreground text-xs font-semibold">CROWD</span>
              </>
            )}
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
                    'hover:text-accent hover:bg-accent/10',
                    active
                      ? 'text-accent bg-accent/10'
                      : 'text-muted-foreground'
                  )}
                >
                  {t(item.key)}
                  {active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="min-w-[60px]"
            >
              {locale === 'en' ? 'العربية' : 'English'}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t mt-2 pt-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium py-3 px-4 rounded-md transition-all duration-200',
                      'hover:text-accent hover:bg-accent/10',
                      active
                        ? 'text-accent bg-accent/10 border-r-2 border-accent'
                        : 'text-muted-foreground'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
              <div className="flex items-center justify-between pt-4 mt-2 border-t">
                <ThemeToggle />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

