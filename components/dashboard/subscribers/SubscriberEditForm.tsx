/* eslint-disable jsx-a11y/label-has-associated-control */
'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updateEventSubscriber } from '@/app/actions/events/actions';
import { showErrorSwal, showSuccessSwal } from '@/lib/utils/swal';
import { Loader2, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { createRegistrationInputSchema } from '@/lib/validations/event';

interface SubscriberEditFormProps {
  locale: string;
  eventId: string;
  subscriber: {
    id: string;
    name: string;
    mobile: string;
    email: string;
    idNumber: string;
    dateOfBirth: string | null;
    nationalityId: string;
    jobRequirementId?: string | null;
    idImageUrl: string | null;
    personalImageUrl: string | null;
    iban: string | null;
    bankName: string | null;
    accountHolderName: string | null;
    gender: string | null;
    idExpiryDate: string | null;
    city: string | null;
  };
  jobs: Array<{
    id: string;
    job: { name: string } | null;
    ratePerDay: number | null;
  }>;
  nationalities: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
  }>;
}

const toDateInputValue = (value: string | null) => {
  if (!value) return '';
  try {
    return value.split('T')[0];
  } catch {
    return '';
  }
};

export function SubscriberEditForm({
  locale,
  eventId,
  subscriber,
  jobs,
  nationalities,
}: SubscriberEditFormProps) {
  const router = useRouter();
  const validationT = useTranslations('validation');
  const placeholdersT = useTranslations('placeholders');
  const isArabic = locale === 'ar';
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>('');
  const [idImageFile, setIdImageFile] = useState<File | null>(null);
  const [personalImageFile, setPersonalImageFile] = useState<File | null>(null);
  const [idImagePreview, setIdImagePreview] = useState<string | null>(subscriber.idImageUrl);
  const [personalImagePreview, setPersonalImagePreview] = useState<string | null>(
    subscriber.personalImageUrl,
  );
  const idImageInputRef = useRef<HTMLInputElement>(null);
  const personalImageInputRef = useRef<HTMLInputElement>(null);

  const editSchema = useMemo(() => {
    const base = createRegistrationInputSchema(
      {
        eventIdRequired: validationT('eventIdRequired'),
        nameTooShort: validationT('nameTooShort'),
        mobileTooShort: validationT('mobileTooShort'),
        invalidEmail: validationT('invalidEmail'),
        idNumberRequired: validationT('idNumberRequired'),
        idNumberInvalid: validationT('idNumberInvalid'),
        idNumberNotString: validationT('idNumberNotString'),
        nationalityRequired: validationT('nationalityRequired'),
        agePositive: validationT('agePositive'),
        ageMin: validationT('ageMin'),
        ageMax: validationT('ageMax'),
        agreeRequired: validationT('agreeRequired'),
        idNumberDigitsOnly: validationT('idNumberDigitsOnly'),
        idNumberLength: validationT('idNumberLength'),
        idNumberInvalidFormat: validationT('idNumberInvalidFormat'),
        idNumberCheckDigit: validationT('idNumberCheckDigit'),
        jobRequired: validationT('jobRequired'),
        idImageRequired: validationT('idImageRequired'),
        personalImageRequired: validationT('personalImageRequired'),
        nameTooLong: validationT('nameTooLong'),
        mobileTooLong: validationT('mobileTooLong'),
        emailTooLong: validationT('emailTooLong'),
        idExpiryRequired: validationT('idExpiryRequired'),
        ibanRequired: validationT('ibanRequired'),
        ibanInvalid: validationT('ibanInvalid'),
        bankNameRequired: validationT('bankNameRequired'),
        accountHolderRequired: validationT('accountHolderRequired'),
        genderRequired: validationT('genderRequired'),
        cityRequired: isArabic ? 'المدينة مطلوبة' : 'City is required',
        cityTooShort: isArabic ? 'اسم المدينة قصير جداً' : 'City name is too short',
        cityTooLong: isArabic ? 'اسم المدينة طويل جداً' : 'City name is too long',
      },
      jobs.length > 0,
    ).omit({ agreeToRequirements: true });

    if (jobs.length > 0) {
      return base.extend({
        jobRequirementId: z.union([z.string().min(1, validationT('jobRequired')), z.literal('none')]),
      });
    }

    return base;
  }, [validationT, jobs.length]);

  type FormValues = z.infer<typeof editSchema>;

  const defaultValues: FormValues = {
    eventId,
    jobRequirementId: subscriber.jobRequirementId ?? 'none',
    name: subscriber.name,
    mobile: subscriber.mobile,
    email: subscriber.email,
    idNumber: subscriber.idNumber,
    nationalityId: subscriber.nationalityId,
    dateOfBirth: toDateInputValue(subscriber.dateOfBirth),
    idImageUrl: subscriber.idImageUrl ?? '',
    personalImageUrl: subscriber.personalImageUrl ?? '',
    idExpiryDate: toDateInputValue(subscriber.idExpiryDate),
    iban: subscriber.iban ?? '',
    bankName: subscriber.bankName ?? '',
    accountHolderName: subscriber.accountHolderName ?? '',
    gender: subscriber.gender ?? '',
    city: subscriber.city ?? '',
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(editSchema),
    defaultValues,
  });

  useEffect(() => {
    form.register('idImageUrl');
    form.register('personalImageUrl');
  }, [form]);

  useEffect(() => {
    return () => {
      if (idImagePreview && idImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(idImagePreview);
      }
      if (personalImagePreview && personalImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(personalImagePreview);
      }
    };
  }, [idImagePreview, personalImagePreview]);

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('table', 'event_subscribers');
    formData.append('uploadOnly', 'true');
    formData.append('folder', folder);

    const response = await fetch('/api/images', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.details || 'Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl as string;
  };

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'id' | 'personal',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showErrorSwal(
        isArabic ? 'الملف المحدد ليس صورة' : 'Selected file is not an image',
        locale,
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showErrorSwal(
        isArabic ? 'حجم الصورة كبير جدًا. الحد الأقصى 5MB' : 'Image size too large. Maximum 5MB',
        locale,
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'id') {
      if (idImagePreview && idImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(idImagePreview);
      }
      setIdImageFile(file);
      setIdImagePreview(previewUrl);
    } else {
      if (personalImagePreview && personalImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(personalImagePreview);
      }
      setPersonalImageFile(file);
      setPersonalImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = (type: 'id' | 'personal') => {
    if (type === 'id') {
      if (idImagePreview && idImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(idImagePreview);
      }
      setIdImageFile(null);
      setIdImagePreview(null);
      form.setValue('idImageUrl', '', { shouldValidate: true });
    } else {
      if (personalImagePreview && personalImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(personalImagePreview);
      }
      setPersonalImageFile(null);
      setPersonalImagePreview(null);
      form.setValue('personalImageUrl', '', { shouldValidate: true });
    }
  };

  const onSubmit = (values: FormValues) => {
    setFormError('');
    startTransition(async () => {
      try {
        let idImageUrl = values.idImageUrl;
        let personalImageUrl = values.personalImageUrl;

        if (!idImageUrl && !idImageFile) {
          setFormError(validationT('idImageRequired'));
          return;
        }

        if (!personalImageUrl && !personalImageFile) {
          setFormError(validationT('personalImageRequired'));
          return;
        }

        if (idImageFile) {
          idImageUrl = await uploadImage(idImageFile, 'subscribers/id-images');
        }
        if (personalImageFile) {
          personalImageUrl = await uploadImage(personalImageFile, 'subscribers/personal-images');
        }

        const { jobRequirementId: formJobRequirementId, ...restValues } = values;
        const normalizedJobRequirementId =
          formJobRequirementId === 'none' ? '' : formJobRequirementId;

        const result = await updateEventSubscriber({
          ...restValues,
          jobRequirementId: normalizedJobRequirementId,
          id: subscriber.id,
          eventId,
          idImageUrl,
          personalImageUrl,
        });

        if (result?.error) {
          setFormError(result.error);
          return;
        }

        showSuccessSwal(
          isArabic ? 'تم تحديث بيانات المشترك بنجاح' : 'Subscriber updated successfully',
          locale,
        );
        router.push(`/${locale}/dashboard/events/${eventId}/subscribers`);
        router.refresh();
      } catch (error) {
        console.error('Update subscriber failed', error);
        showErrorSwal(
          error instanceof Error
            ? error.message
            : isArabic
            ? 'حدث خطأ أثناء تحديث المشترك'
            : 'An error occurred while updating the subscriber',
          locale,
        );
      }
    });
  };

  const jobRequirementId = form.watch('jobRequirementId') ?? 'none';
  const nationalityId = form.watch('nationalityId') || '';
  const gender = form.watch('gender') || '';

  const renderImageInput = (
    label: string,
    preview: string | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
    onSelect: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove: () => void,
  ) => (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <div
        className="relative w-full h-64 border-2 border-dashed border-border rounded-md overflow-hidden bg-muted/50 cursor-pointer group hover:border-primary/50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt={label}
              fill
              sizes="100%"
              className="object-contain rounded-md"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 hover:bg-destructive/90 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <Plus className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'انقر لاختيار صورة' : 'Click to select image'}
              </p>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onSelect}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-lg">
                {isArabic ? 'تعديل بيانات المشترك' : 'Edit Subscriber'}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-4">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'الاسم' : 'Name'} <span className="text-red-500">*</span>
                    </label>
                    <Input {...form.register('name')} placeholder={placeholdersT('name')} maxLength={100} />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.name.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'الجوال' : 'Mobile'} <span className="text-red-500">*</span>
                    </label>
                    <Input {...form.register('mobile')} placeholder={placeholdersT('mobile')} maxLength={15} />
                    {form.formState.errors.mobile && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.mobile.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'المدينة' : 'City'} <span className="text-red-500">*</span>
                    </label>
                    <Input {...form.register('city')} placeholder={isArabic ? 'المدينة' : 'City'} maxLength={100} />
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.city.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      {...form.register('email')}
                      placeholder={placeholdersT('email')}
                      maxLength={255}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.email.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'رقم الهوية' : 'ID Number'} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...form.register('idNumber')}
                      placeholder={placeholdersT('idNumber')}
                      maxLength={10}
                    />
                    {form.formState.errors.idNumber && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.idNumber.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'تاريخ انتهاء الهوية' : 'ID Expiry Date'} <span className="text-red-500">*</span>
                    </label>
                    <Input type="date" {...form.register('idExpiryDate')} placeholder={placeholdersT('idExpiryDate')} />
                    {form.formState.errors.idExpiryDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.idExpiryDate.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'الجنسية' : 'Nationality'} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={nationalityId}
                      onValueChange={(value) => form.setValue('nationalityId', value, { shouldValidate: true })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={placeholdersT('selectNationality')} />
                      </SelectTrigger>
                      <SelectContent>
                        {nationalities.map((nationality) => (
                          <SelectItem key={nationality.id} value={nationality.id}>
                            {isArabic ? nationality.nameAr : nationality.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.nationalityId && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.nationalityId.message as string}
                      </p>
                    )}
                  </div>
                  {jobs.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {isArabic ? 'الوظيفة' : 'Job'} <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={jobRequirementId}
                        onValueChange={(value) =>
                          form.setValue('jobRequirementId', value, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={placeholdersT('selectJob')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{isArabic ? 'بدون وظيفة' : 'No Job'}</SelectItem>
                          {jobs.map((jobRequirement) => (
                            <SelectItem key={jobRequirement.id} value={jobRequirement.id}>
                              {jobRequirement.job?.name || (isArabic ? 'وظيفة غير معروفة' : 'Unknown Job')}
                              {jobRequirement.ratePerDay != null && (
                                <> — {jobRequirement.ratePerDay} {isArabic ? 'ريال/يوم' : 'SAR/day'}</>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.jobRequirementId && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.jobRequirementId.message as string}
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'الجنس' : 'Gender'} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={gender}
                      onValueChange={(value) => form.setValue('gender', value, { shouldValidate: true })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={placeholdersT('selectGender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{isArabic ? 'ذكر' : 'Male'}</SelectItem>
                        <SelectItem value="female">{isArabic ? 'أنثى' : 'Female'}</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.gender && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.gender.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'تاريخ الميلاد' : 'Date of Birth'} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      {...form.register('dateOfBirth')}
                      placeholder={isArabic ? 'اختر تاريخ الميلاد' : 'Select date of birth'}
                    />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.dateOfBirth.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'الآيبان' : 'IBAN'} <span className="text-red-500">*</span>
                    </label>
                    <Input {...form.register('iban')} placeholder={placeholdersT('iban')} maxLength={34} />
                    {form.formState.errors.iban && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.iban.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'اسم البنك' : 'Bank Name'} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...form.register('bankName')}
                      placeholder={placeholdersT('bankName')}
                      maxLength={100}
                    />
                    {form.formState.errors.bankName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.bankName.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isArabic ? 'اسم مالك الحساب' : 'Account Holder Name'} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...form.register('accountHolderName')}
                      placeholder={placeholdersT('accountHolderName')}
                      maxLength={100}
                    />
                    {form.formState.errors.accountHolderName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.accountHolderName.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {renderImageInput(
                  isArabic ? 'صورة الهوية من توكلنا' : 'ID Image',
                  idImagePreview,
                  idImageInputRef,
                  (e) => handleImageSelect(e, 'id'),
                  () => handleRemoveImage('id'),
                )}
                {form.formState.errors.idImageUrl && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.idImageUrl.message as string}
                  </p>
                )}

                {renderImageInput(
                  isArabic ? 'الصورة الشخصية خلفية بيضاء' : 'Personal Image',
                  personalImagePreview,
                  personalImageInputRef,
                  (e) => handleImageSelect(e, 'personal'),
                  () => handleRemoveImage('personal'),
                )}
                {form.formState.errors.personalImageUrl && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.personalImageUrl.message as string}
                  </p>
                )}

                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                      </span>
                    ) : (
                      <>{isArabic ? 'حفظ التعديلات' : 'Save changes'}</>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => router.push(`/${locale}/dashboard/events/${eventId}/subscribers`)}
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

