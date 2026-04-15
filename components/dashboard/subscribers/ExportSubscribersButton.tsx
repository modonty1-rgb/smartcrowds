'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useTransition, useState } from 'react';
import { exportEventSubscribersToCSV } from '@/app/actions/events/actions';
import { useLocale } from 'next-intl';
import { showErrorSwal } from '@/lib/utils/swal';

interface ExportSubscribersButtonProps {
  eventId: string;
  eventTitle: string;
}

export function ExportSubscribersButton({ eventId, eventTitle }: ExportSubscribersButtonProps) {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const handleExport = () => {
    startTransition(async () => {
      const result = await exportEventSubscribersToCSV(eventId);
      
      if (result.success && result.csv) {
        // Create blob and download
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        // Sanitize event title for filename
        const sanitizedTitle = eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `subscribers_${sanitizedTitle}_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
      } else {
        showErrorSwal(result.error || (isArabic ? 'فشل تصدير المشتركين' : 'Failed to export subscribers'), locale);
      }
    });
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isPending}
      variant="outline"
      className="gap-2"
    >
      {isPending ? (
        <>
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {isArabic ? 'جاري التصدير...' : 'Exporting...'}
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {isArabic ? 'تصدير إلى CSV' : 'Export to CSV'}
        </>
      )}
    </Button>
  );
}

