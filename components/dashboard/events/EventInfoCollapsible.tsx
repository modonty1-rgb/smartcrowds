import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface EventInfoCollapsibleProps {
  title: string;
  titleAr?: string | null;
  date: Date;
  location?: {
    city: string;
    address?: string | null;
  } | null;
  locale: string;
}

export function EventInfoCollapsible({
  title,
  titleAr,
  date,
  location,
  locale,
}: EventInfoCollapsibleProps) {
  const isArabic = locale === 'ar';
  const displayTitle = isArabic && titleAr ? titleAr : title;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {displayTitle}
            </h2>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(new Date(date), 'PPP')}</span>
            </div>
            {location && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  {location.city}
                  {location.address ? ` - ${location.address}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

