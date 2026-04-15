'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';
import { showErrorSwal } from '@/lib/utils/swal';

export function TranslateJobsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const locale = useLocale();
  const isArabic = locale === 'ar';

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleTranslate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/jobs/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        const message = isArabic
          ? `تمت الترجمة بنجاح: ${result.translated} وظيفة تم ترجمتها، ${result.skipped} تم تخطيها`
          : `Translation completed: ${result.translated} jobs translated, ${result.skipped} skipped`;
        
        alert(message);
        
        // Show errors if any
        if (result.errors && result.errors.length > 0) {
          console.warn('Translation errors:', result.errors);
          const errorMessage = result.errors.slice(0, 5).join('\n');
          alert(
            isArabic
              ? `بعض الوظائف لم يتم ترجمتها:\n${errorMessage}`
              : `Some jobs were skipped:\n${errorMessage}`
          );
        }

        // Refresh the page to show updated jobs
        window.location.reload();
      } else {
        showErrorSwal(result.error || 'Failed to translate jobs', locale);
      }
    } catch (error) {
      console.error('Error translating jobs:', error);
      showErrorSwal(
        isArabic
          ? 'حدث خطأ أثناء الترجمة'
          : 'An error occurred while translating',
        locale
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTranslate}
      disabled={isLoading}
      variant="outline"
      className="ml-2"
    >
      {isLoading
        ? isArabic
          ? 'جاري الترجمة...'
          : 'Translating...'
        : isArabic
        ? 'ترجمة جميع الوظائف'
        : 'Translate All Jobs'}
    </Button>
  );
}

