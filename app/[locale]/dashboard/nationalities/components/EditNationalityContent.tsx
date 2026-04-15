import { NationalityForm } from '@/components/dashboard/nationalities/NationalityForm';
import { getNationality } from '../actions/actions';

interface EditNationalityContentProps {
  nationalityId: string;
  locale: string;
}

export async function EditNationalityContent({ nationalityId, locale }: EditNationalityContentProps) {
  const nationality = await getNationality(nationalityId);
  if (!nationality) return <p className="text-muted-foreground">{locale === 'ar' ? 'غير موجود' : 'Not found'}</p>;
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">{locale === 'ar' ? 'تعديل جنسية' : 'Edit Nationality'}</h1>
      <NationalityForm
        id={nationality.id}
        nameAr={nationality.nameAr}
        nameEn={nationality.nameEn}
        locale={locale}
      />
    </>
  );
}

