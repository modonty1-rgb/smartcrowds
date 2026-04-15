import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { listNationalities } from '../actions/actions';

interface NationalitiesListContentProps {
  locale: string;
}

export async function NationalitiesListContent({ locale }: NationalitiesListContentProps) {
  type NationalityItem = { id: string; nameAr: string; nameEn: string };
  const nationalities = (await listNationalities()) as unknown as NationalityItem[];
  const t = (en: string, ar: string) => (locale === 'ar' ? ar : en);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('Nationalities', 'الجنسيات')}</h1>
        <Link href={`./nationalities/new`}>
          <Button>{t('Create Nationality', 'إنشاء جنسية')}</Button>
        </Link>
      </div>
      <div className="space-y-2">
        {nationalities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('No nationalities yet', 'لا توجد جنسيات بعد')}
          </div>
        ) : (
          nationalities.map((nationality: NationalityItem) => (
            <div key={nationality.id} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">
                  {locale === 'ar' ? nationality.nameAr : nationality.nameEn}
                </div>
                <div className="text-sm text-muted-foreground">
                  {locale === 'ar' ? nationality.nameEn : nationality.nameAr}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`./nationalities/${nationality.id}/edit`}>
                  <Button variant="outline" size="sm">{t('Edit', 'تعديل')}</Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

