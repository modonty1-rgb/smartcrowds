'use client';

import { useState, useTransition } from 'react';
import { Settings, Globe, ToggleLeft, ToggleRight, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  updateEventPublished,
  updateEventAcceptJobs,
  updateEventCompleted,
} from '@/app/actions/events/actions';
import { useRouter } from '@/lib/routing';
import { cn } from '@/lib/utils';
import { showErrorSwal } from '@/lib/utils/swal';
import { Link } from '@/lib/routing';

interface EventSettingsMenuProps {
  eventId: string;
  published: boolean;
  acceptJobs: boolean;
  completed: boolean;
  locale: string;
}

export function EventSettingsMenu({
  eventId,
  published,
  acceptJobs,
  completed,
  locale,
}: EventSettingsMenuProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticPublished, setOptimisticPublished] = useState(published);
  const [optimisticAcceptJobs, setOptimisticAcceptJobs] = useState(acceptJobs);
  const [optimisticCompleted, setOptimisticCompleted] = useState(completed);
  const [loadingSetting, setLoadingSetting] = useState<'acceptJobs' | 'published' | 'completed' | null>(null);
  const router = useRouter();
  const isArabic = locale === 'ar';

  const handleTogglePublished = () => {
    const newValue = !optimisticPublished;
    setOptimisticPublished(newValue);
    setLoadingSetting('published');
    startTransition(async () => {
      const result = await updateEventPublished(eventId, newValue);
      setLoadingSetting(null);
      if (!result.success) {
        setOptimisticPublished(published);
        showErrorSwal(result.error || (isArabic ? 'فشل تحديث حالة النشر' : 'Failed to update published status'), locale);
      } else {
        router.refresh();
      }
    });
  };

  const handleToggleAcceptJobs = () => {
    const newValue = !optimisticAcceptJobs;
    setOptimisticAcceptJobs(newValue);
    setLoadingSetting('acceptJobs');
    startTransition(async () => {
      const result = await updateEventAcceptJobs(eventId, newValue);
      setLoadingSetting(null);
      if (!result.success) {
        setOptimisticAcceptJobs(acceptJobs);
        showErrorSwal(result.error || (isArabic ? 'فشل تحديث حالة قبول الوظائف' : 'Failed to update accept jobs status'), locale);
      } else {
        router.refresh();
      }
    });
  };

  const handleToggleCompleted = () => {
    const newValue = !optimisticCompleted;
    setOptimisticCompleted(newValue);
    setLoadingSetting('completed');
    startTransition(async () => {
      const result = await updateEventCompleted(eventId, newValue);
      setLoadingSetting(null);
      if (!result.success) {
        setOptimisticCompleted(completed);
        showErrorSwal(result.error || (isArabic ? 'فشل تحديث حالة الإنجاز' : 'Failed to update completed status'), locale);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
          <span className="sr-only">{isArabic ? 'الإعدادات' : 'Settings'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isArabic ? 'start' : 'end'}>
        <DropdownMenuItem asChild className="cursor-pointer gap-2">
          <Link href={`/dashboard/events/${eventId}/edit`}>
            <Settings className="h-4 w-4" />
            <span>{isArabic ? 'تعديل' : 'Edit'}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleToggleAcceptJobs}
          disabled={isPending}
          className="cursor-pointer gap-2"
        >
          {loadingSetting === 'acceptJobs' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : optimisticAcceptJobs ? (
            <ToggleRight className="h-4 w-4 text-green-600" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
          )}
          <span>
            {isArabic
              ? optimisticAcceptJobs
                ? 'إيقاف قبول الوظائف'
                : 'السماح بقبول الوظائف'
              : optimisticAcceptJobs
                ? 'Stop Accepting Jobs'
                : 'Allow Accepting Jobs'}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleTogglePublished}
          disabled={isPending}
          className="cursor-pointer gap-2"
        >
          {loadingSetting === 'published' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : optimisticPublished ? (
            <Globe className="h-4 w-4 text-blue-600" />
          ) : (
            <Globe className="h-4 w-4 text-muted-foreground" />
          )}
          <span>
            {isArabic
              ? optimisticPublished
                ? 'إلغاء النشر'
                : 'نشر'
              : optimisticPublished
                ? 'Unpublish'
                : 'Publish'}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleToggleCompleted}
          disabled={isPending}
          className="cursor-pointer gap-2"
        >
          {loadingSetting === 'completed' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : optimisticCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
          <span>
            {isArabic
              ? optimisticCompleted
                ? 'إلغاء الإنجاز'
                : 'تم التنفيذ'
              : optimisticCompleted
                ? 'Mark as Not Done'
                : 'Mark as Done'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

