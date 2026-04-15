import { notFound } from 'next/navigation';
import { EventRequirementsForm } from '@/components/dashboard/events/EventRequirementsForm';
import { EventRequirementsTable } from '@/components/dashboard/events/EventRequirementsTable';
import { EventInfoCollapsible } from '@/components/dashboard/events/EventInfoCollapsible';
import { getEventWithJobs } from '../actions/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EventRequirementsContentProps {
  eventId: string;
  locale: string;
}

type Requirement = { name: string; nameAr: string };

function parseRequirements(
  requirements: unknown
): Array<{ name: string; nameAr: string }> {
  if (!requirements || !Array.isArray(requirements)) {
    return [];
  }

  return requirements.map((req) => {
    if (typeof req === 'string') {
      // Try to parse as JSON first (for new format)
      try {
        const parsed = JSON.parse(req);
        if (parsed && typeof parsed === 'object' && 'name' in parsed && 'nameAr' in parsed) {
          return {
            name: String(parsed.name || ''),
            nameAr: String(parsed.nameAr || ''),
          };
        }
      } catch {
        // Not JSON, treat as plain string (backward compatibility)
      }
      // Plain string - use for both languages
      return { name: req, nameAr: req };
    }
    // Already an object (shouldn't happen with Prisma String[], but handle it)
    if (typeof req === 'object' && req !== null && 'name' in req && 'nameAr' in req) {
      return {
        name: String(req.name || ''),
        nameAr: String(req.nameAr || ''),
      };
    }
    return { name: String(req || ''), nameAr: String(req || '') };
  });
}

export async function EventRequirementsContent({ eventId, locale }: EventRequirementsContentProps) {
  const event = await getEventWithJobs(eventId);

  if (!event) {
    notFound();
  }

  const isArabic = locale === 'ar';
  const requirements = parseRequirements(event.requirements);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {isArabic ? 'إدارة المتطلبات' : 'Manage Requirements'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? 'إدارة متطلبات الفعالية'
              : 'Manage event requirements'}
          </p>
        </div>
        <Link href="/dashboard/events">
          <Button variant="outline">
            {isArabic ? 'العودة للقائمة' : 'Back to List'}
          </Button>
        </Link>
      </div>

          <EventInfoCollapsible
            title={event.title}
            titleAr={(event as typeof event & { titleAr?: string | null }).titleAr}
            date={event.date}
            location={event.location}
            locale={locale}
          />

      <EventRequirementsForm
        eventId={eventId}
        currentRequirements={requirements}
        locale={locale}
      />

      <EventRequirementsTable
        requirements={requirements}
        eventId={eventId}
        locale={locale}
      />
    </section>
  );
}

