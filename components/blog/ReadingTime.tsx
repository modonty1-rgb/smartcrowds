import { Clock } from 'lucide-react';

interface ReadingTimeProps {
  minutes: number;
  locale: string;
  className?: string;
}

export function ReadingTime({ minutes, locale, className }: ReadingTimeProps) {
  if (minutes <= 0) return null;

  return (
    <div className={`flex items-center gap-1 text-sm text-muted-foreground ${className || ''}`}>
      <Clock className="h-4 w-4" />
      <span>
        {minutes} {locale === 'ar' ? 'دقيقة قراءة' : minutes === 1 ? 'min read' : 'min read'}
      </span>
    </div>
  );
}






















