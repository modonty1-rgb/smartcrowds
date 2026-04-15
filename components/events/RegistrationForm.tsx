'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRegistrationInputSchema } from '@/lib/validations/event';
import { registerForEvent, verifyIdNumber } from '@/app/actions/events/actions';
import { useTransition, useState, useRef, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { showSuccessSwal, showErrorSwal } from '@/lib/utils/swal';
import Image from 'next/image';
import { Plus, X, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RegistrationFormProps {
  eventId: string;
  requirements: string[];
  jobs: Array<{
    id: string;
    job: { name: string; nameAr?: string | null } | null;
    ratePerDay: number | null;
  }>;
  nationalities: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
  }>;
  locale: string;
}

export default function RegistrationForm({ eventId, requirements, jobs, nationalities, locale }: RegistrationFormProps) {
  const t = useTranslations('validation');
  const tPlaceholders = useTranslations('placeholders');
  const tPledge = useTranslations('pledge');
  const [isPending, startTransition] = useTransition();
  const [idImageFile, setIdImageFile] = useState<File | null>(null);
  const [personalImageFile, setPersonalImageFile] = useState<File | null>(null);
  const [idImagePreview, setIdImagePreview] = useState<string | null>(null);
  const [personalImagePreview, setPersonalImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [showPledgeDialog, setShowPledgeDialog] = useState(false);
  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [verifyingId, setVerifyingId] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<Values | null>(null);
  const idImageInputRef = useRef<HTMLInputElement>(null);
  const personalImageInputRef = useRef<HTMLInputElement>(null);
  const isArabic = locale === 'ar';

  // Create locale-aware schema
  const registrationInputSchema = useMemo(() => {
    return createRegistrationInputSchema({
      eventIdRequired: t('eventIdRequired'),
      nameTooShort: t('nameTooShort'),
      mobileTooShort: t('mobileTooShort'),
      invalidEmail: t('invalidEmail'),
      idNumberRequired: t('idNumberRequired'),
      idNumberInvalid: t('idNumberInvalid'),
      idNumberNotString: t('idNumberNotString'),
      nationalityRequired: t('nationalityRequired'),
      agePositive: t('agePositive'),
      ageMin: t('ageMin'),
      ageMax: t('ageMax'),
      agreeRequired: t('agreeRequired'),
      idNumberDigitsOnly: t('idNumberDigitsOnly'),
      idNumberLength: t('idNumberLength'),
      idNumberInvalidFormat: t('idNumberInvalidFormat'),
      idNumberCheckDigit: t('idNumberCheckDigit'),
      jobRequired: t('jobRequired'),
      idImageRequired: t('idImageRequired'),
      personalImageRequired: t('personalImageRequired'),
      nameTooLong: t('nameTooLong'),
      mobileTooLong: t('mobileTooLong'),
      emailTooLong: t('emailTooLong'),
      idExpiryRequired: t('idExpiryRequired'),
      ibanRequired: t('ibanRequired'),
      ibanInvalid: t('ibanInvalid'),
      bankNameRequired: t('bankNameRequired'),
      accountHolderRequired: t('accountHolderRequired'),
      genderRequired: t('genderRequired'),
      cityRequired: isArabic ? 'المدينة مطلوبة' : 'City is required',
      cityTooShort: isArabic ? 'اسم المدينة قصير جداً' : 'City name is too short',
      cityTooLong: isArabic ? 'اسم المدينة طويل جداً' : 'City name is too long',
    }, jobs.length > 0);
  }, [t, jobs.length]);

  type Values = z.input<typeof registrationInputSchema>;

  const { register, handleSubmit, formState: { errors }, watch, reset, setValue, trigger } = useForm<Values>({
    resolver: zodResolver(registrationInputSchema),
    defaultValues: {
      eventId,
      jobRequirementId: '',
      name: '',
      mobile: '',
      email: '',
      idNumber: '',
      nationalityId: '',
      dateOfBirth: '',
      idImageUrl: '',
      personalImageUrl: '',
      idExpiryDate: '',
      iban: '',
      bankName: '',
      accountHolderName: '',
      gender: '',
      city: '',
      agreeToRequirements: false as unknown as true,
    },
  });

  const agreeChecked = watch('agreeToRequirements' as any) as unknown as boolean;

  // Update hidden fields when files are selected/removed
  useEffect(() => {
    setValue('idImageUrl', idImageFile ? 'uploaded' : '', { shouldValidate: true });
  }, [idImageFile, setValue]);

  useEffect(() => {
    setValue('personalImageUrl', personalImageFile ? 'uploaded' : '', { shouldValidate: true });
  }, [personalImageFile, setValue]);

  // Clean up preview URLs when component unmounts or files change
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

  const handleIdImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError(isArabic ? 'الملف المحدد ليس صورة' : 'Selected file is not an image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(isArabic ? 'حجم الصورة كبير جدًا. الحد الأقصى 5MB' : 'Image size too large. Maximum 5MB');
      return;
    }

    setIdImageFile(file);
    setUploadError('');

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setIdImagePreview(previewUrl);
    setValue('idImageUrl', 'uploaded', { shouldValidate: true });
  };

  const handlePersonalImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError(isArabic ? 'الملف المحدد ليس صورة' : 'Selected file is not an image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(isArabic ? 'حجم الصورة كبير جدًا. الحد الأقصى 5MB' : 'Image size too large. Maximum 5MB');
      return;
    }

    setPersonalImageFile(file);
    setUploadError('');

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPersonalImagePreview(previewUrl);
    setValue('personalImageUrl', 'uploaded', { shouldValidate: true });
  };

  const removeIdImage = () => {
    if (idImagePreview && idImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(idImagePreview);
    }
    setIdImageFile(null);
    setIdImagePreview(null);
    setValue('idImageUrl', '', { shouldValidate: true });
    if (idImageInputRef.current) {
      idImageInputRef.current.value = '';
    }
  };

  const removePersonalImage = () => {
    if (personalImagePreview && personalImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(personalImagePreview);
    }
    setPersonalImageFile(null);
    setPersonalImagePreview(null);
    setValue('personalImageUrl', '', { shouldValidate: true });
    if (personalImageInputRef.current) {
      personalImageInputRef.current.value = '';
    }
  };

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
    return data.imageUrl;
  };

  const onSubmit = async (values: Values) => {
    setUploadError('');

    // Validate images are selected before verifying ID
    if (!idImageFile) {
      setValue('idImageUrl', '', { shouldValidate: true });
      return;
    }
    if (!personalImageFile) {
      setValue('personalImageUrl', '', { shouldValidate: true });
      return;
    }

    // Verify ID number first
    setVerifyingId(true);
    const idNumber = values.idNumber;

    try {
      const verification = await verifyIdNumber(eventId, idNumber);

      if (!verification.valid) {
        setVerifyingId(false);
        showErrorSwal(verification.error || (isArabic ? 'رقم الهوية غير صحيح' : 'Invalid ID number'), locale);
        return;
      }

      if (verification.isDuplicate) {
        setVerifyingId(false);
        showErrorSwal(verification.error || (isArabic ? 'رقم الهوية مسجل مسبقاً' : 'ID number already registered'), locale);
        return;
      }

      // ID is valid and not duplicate, show pledge dialog
      setVerifyingId(false);
      setPendingFormValues(values);
      setShowPledgeDialog(true);
      setPledgeAccepted(false);
    } catch (error) {
      setVerifyingId(false);
      setUploadError(
        error instanceof Error
          ? error.message
          : (isArabic ? 'حدث خطأ أثناء التحقق من الهوية' : 'An error occurred during ID verification')
      );
    }
  };

  const handleSaveWithPledge = () => {
    if (!pledgeAccepted || !pendingFormValues) return;

    startTransition(async () => {
      setUploading(true);

      try {
        let idImageUrl = '';
        let personalImageUrl = '';

        // Upload images
        try {
          idImageUrl = await uploadImage(idImageFile!, 'subscribers/id-images');
        } catch (error) {
          setUploading(false);
          setUploadError(
            error instanceof Error
              ? error.message
              : (isArabic ? 'فشل رفع صورة الهوية' : 'Failed to upload ID image')
          );
          return;
        }

        try {
          personalImageUrl = await uploadImage(personalImageFile!, 'subscribers/personal-images');
        } catch (error) {
          setUploading(false);
          setUploadError(
            error instanceof Error
              ? error.message
              : (isArabic ? 'فشل رفع الصورة الشخصية' : 'Failed to upload personal image')
          );
          return;
        }

        // Proceed with registration
        const result = await registerForEvent({
          ...pendingFormValues,
          idImageUrl,
          personalImageUrl,
        });

        if (result.success) {
          // Clean up preview URLs
          if (idImagePreview && idImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(idImagePreview);
          }
          if (personalImagePreview && personalImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(personalImagePreview);
          }

          reset();
          setIdImageFile(null);
          setPersonalImageFile(null);
          setIdImagePreview(null);
          setPersonalImagePreview(null);
          setUploading(false);
          setShowPledgeDialog(false);
          setPledgeAccepted(false);
          setPendingFormValues(null);
          showSuccessSwal(isArabic ? 'تم التسجيل بنجاح' : 'Registration successful', locale);
        } else {
          setUploading(false);
          showErrorSwal(result.error || (isArabic ? 'فشل التسجيل' : 'Registration failed'), locale);
        }
      } catch (error) {
        setUploading(false);
        setUploadError(
          error instanceof Error
            ? error.message
            : (isArabic ? 'حدث خطأ أثناء التسجيل' : 'An error occurred during registration')
        );
      }
    });
  };

  const renderImageInput = (
    label: string,
    file: File | null,
    preview: string | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
    onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove: () => void
  ) => (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative w-full h-64 border-2 border-dashed border-border rounded-md overflow-hidden bg-muted/50 cursor-pointer group hover:border-primary/50 transition-colors" onClick={() => inputRef.current?.click()}>
        {preview ? (
          <>
            <Image
              src={preview}
              alt={label}
              fill
              sizes="100%"
              className="object-contain rounded-md"
              priority
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
      {/* Agreement Checkbox */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
          <input
            id="agree"
            type="checkbox"
            {...register('agreeToRequirements' as any)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="agree" className="text-sm font-medium cursor-pointer flex-1">
            {isArabic ? 'أوافق على متطلبات الفعالية' : 'I agree to event requirements'}
          </label>
        </div>
        {errors.agreeToRequirements && (
          <p className="text-sm text-red-600">{errors.agreeToRequirements.message as string}</p>
        )}
        {!agreeChecked && (
          <p className="text-sm text-muted-foreground px-4">
            {isArabic
              ? 'يرجى الموافقة على المتطلبات لعرض نموذج التسجيل'
              : 'Please agree to the requirements to view the registration form'}
          </p>
        )}
      </div>

      {/* Collapsible Form Section */}
      <Collapsible open={agreeChecked}>
        <CollapsibleContent className="space-y-6 pt-4 border-t border-border/50">
          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {isArabic ? 'معلومات التسجيل' : 'Registration Information'}
              </h3>

              {/* Job Selection */}
              {jobs.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'اختر الوظيفة' : 'Select Job'} <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={watch('jobRequirementId') || ''}
                    onValueChange={(value) => setValue('jobRequirementId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tPlaceholders('selectJob')} />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((jobRequirement) => {
                        const jobDisplayName = isArabic && jobRequirement.job?.nameAr
                          ? jobRequirement.job.nameAr
                          : jobRequirement.job?.name || 'Unknown Job';
                        return (
                          <SelectItem key={jobRequirement.id} value={jobRequirement.id}>
                            {jobDisplayName}
                            {jobRequirement.ratePerDay != null && jobRequirement.ratePerDay > 0 && (
                              <> — {jobRequirement.ratePerDay} {isArabic ? 'ريال/يوم' : 'SAR/day'}</>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.jobRequirementId && (
                    <p className="text-sm text-red-600 mt-1">{errors.jobRequirementId.message}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'الاسم الثلاثي بالعربي' : 'Full Name (Arabic)'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('name')}
                    placeholder={isArabic ? 'الاسم الثلاثي بالعربي' : tPlaceholders('name')}
                    maxLength={100}
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'الجوال' : 'Mobile'} <span className="text-red-500">*</span>
                  </label>
                  <Input {...register('mobile')} placeholder={tPlaceholders('mobile')} maxLength={15} />
                  {errors.mobile && <p className="text-sm text-red-600 mt-1">{errors.mobile.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
                  </label>
                  <Input type="email" {...register('email')} placeholder={tPlaceholders('email')} maxLength={255} />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'المدينة' : 'City'} <span className="text-red-500">*</span>
                  </label>
                  <Input {...register('city')} placeholder={isArabic ? 'المدينة' : 'City'} maxLength={100} />
                  {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'رقم الهوية' : 'ID Number'} <span className="text-red-500">*</span>
                  </label>
                  <Input {...register('idNumber')} placeholder={tPlaceholders('idNumber')} maxLength={10} />
                  {errors.idNumber && <p className="text-sm text-red-600 mt-1">{errors.idNumber.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'تاريخ انتهاء الهوية' : 'ID Expiry Date'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    {...register('idExpiryDate')}
                    placeholder={tPlaceholders('idExpiryDate')}
                  />
                  {errors.idExpiryDate && <p className="text-sm text-red-600 mt-1">{errors.idExpiryDate.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'الجنسية' : 'Nationality'} <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={watch('nationalityId') || ''}
                    onValueChange={(value) => setValue('nationalityId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tPlaceholders('selectNationality')} />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.map((nationality) => (
                        <SelectItem key={nationality.id} value={nationality.id}>
                          {isArabic ? nationality.nameAr : nationality.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.nationalityId && (
                    <p className="text-sm text-red-600 mt-1">{errors.nationalityId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'الجنس' : 'Gender'} <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={watch('gender') || ''}
                    onValueChange={(value) => setValue('gender', value, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tPlaceholders('selectGender')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{isArabic ? 'ذكر' : 'Male'}</SelectItem>
                      <SelectItem value="female">{isArabic ? 'أنثى' : 'Female'}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-600 mt-1">{errors.gender.message as string}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'تاريخ الميلاد' : 'Date of Birth'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    {...register('dateOfBirth')}
                    placeholder={isArabic ? 'اختر تاريخ الميلاد' : 'Select date of birth'}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'الآيبان' : 'IBAN'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('iban')}
                    placeholder={tPlaceholders('iban')}
                    maxLength={34}
                  />
                  {errors.iban && <p className="text-sm text-red-600 mt-1">{errors.iban.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isArabic ? 'اسم البنك' : 'Bank Name'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('bankName')}
                    placeholder={tPlaceholders('bankName')}
                    maxLength={100}
                  />
                  {errors.bankName && <p className="text-sm text-red-600 mt-1">{errors.bankName.message as string}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {isArabic ? 'اسم مالك الحساب' : 'Account Holder Name'} <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('accountHolderName')}
                  placeholder={tPlaceholders('accountHolderName')}
                  maxLength={100}
                />
                {errors.accountHolderName && (
                  <p className="text-sm text-red-600 mt-1">{errors.accountHolderName.message as string}</p>
                )}
              </div>

              {renderImageInput(
                isArabic ? 'صورة الهوية من توكلنا' : 'ID Image (Tawakkalna)',
                idImageFile,
                idImagePreview,
                idImageInputRef,
                handleIdImageSelect,
                removeIdImage
              )}
              {errors.idImageUrl && <p className="text-sm text-red-600 mt-1">{errors.idImageUrl.message}</p>}

              {renderImageInput(
                isArabic ? 'الصورة الشخصية  خلفية بيضاء' : 'Personal Image (White Background)',
                personalImageFile,
                personalImagePreview,
                personalImageInputRef,
                handlePersonalImageSelect,
                removePersonalImage
              )}
              {errors.personalImageUrl && <p className="text-sm text-red-600 mt-1">{errors.personalImageUrl.message}</p>}

              {uploadError && (
                <Alert variant="destructive">
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              <input type="hidden" {...register('eventId')} value={eventId} />
              <input type="hidden" {...register('jobRequirementId')} value={watch('jobRequirementId') || ''} />
              <input type="hidden" {...register('nationalityId')} value={watch('nationalityId') || ''} />
              <input type="hidden" {...register('gender')} value={watch('gender') || ''} />
              <input type="hidden" {...register('idImageUrl')} value={idImageFile ? 'uploaded' : ''} />
              <input type="hidden" {...register('personalImageUrl')} value={personalImageFile ? 'uploaded' : ''} />
            </div>

            <Button type="submit" disabled={isPending || uploading || verifyingId || !agreeChecked || (jobs.length > 0 && !watch('jobRequirementId')) || !watch('nationalityId') || !idImageFile || !personalImageFile} className="w-full">
              {verifyingId ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isArabic ? 'جاري التحقق من الهوية...' : 'Verifying ID...'}
                </span>
              ) : uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isArabic ? 'جاري رفع الصور والتسجيل...' : 'Uploading images and registering...'}
                </span>
              ) : isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isArabic ? 'جاري التسجيل...' : 'Submitting...'}
                </span>
              ) : (
                isArabic ? 'تسجيل' : 'Register'
              )}
            </Button>
          </form>
        </CollapsibleContent>
      </Collapsible>

      {/* Pledge Dialog */}
      <AlertDialog open={showPledgeDialog} onOpenChange={setShowPledgeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tPledge('title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tPledge('verified')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            {/* Scrollable Pledge Text */}
            <div className="max-h-48 overflow-y-auto p-4 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {tPledge('description')}
              </p>
            </div>
            {/* Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
              <input
                id="pledge-checkbox"
                type="checkbox"
                checked={pledgeAccepted}
                onChange={(e) => setPledgeAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="pledge-checkbox" className="text-sm font-medium cursor-pointer flex-1">
                {tPledge('accept')}
              </label>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowPledgeDialog(false);
              setPledgeAccepted(false);
              setPendingFormValues(null);
            }}>
              {tPledge('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveWithPledge}
              disabled={!pledgeAccepted || uploading || isPending}
            >
              {uploading || isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                </span>
              ) : (
                tPledge('save')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
