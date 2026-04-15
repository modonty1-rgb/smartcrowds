'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Briefcase, X } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriberDetailDialogProps {
  subscriber: {
    id: string;
    name: string;
    mobile: string;
    email: string;
    idNumber: string;
    age: number;
    dateOfBirth?: Date | string | null;
    idImageUrl: string | null;
    personalImageUrl: string | null;
    createdAt: Date;
    jobRequirement: {
      id: string;
      job: { name: string } | null;
      ratePerDay: number | null;
    } | null;
    nationality: {
      nameAr: string;
      nameEn: string;
    } | null;
    accepted?: boolean;
    idExpiryDate?: Date | string | null;
    iban?: string | null;
    bankName?: string | null;
    accountHolderName?: string | null;
    gender?: string | null;
    city?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
}

export function SubscriberDetailDialog({
  subscriber,
  open,
  onOpenChange,
  locale,
}: SubscriberDetailDialogProps) {
  const isArabic = locale === 'ar';
  const formatIban = (iban?: string | null) =>
    iban ? iban.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim() : '';

  if (!subscriber) return null;
  const formattedIban = formatIban(subscriber.iban);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center justify-between gap-4">
            <AlertDialogTitle className="text-xl">
              {isArabic ? 'تفاصيل المشترك' : 'Subscriber Details'}
            </AlertDialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label={isArabic ? 'إغلاق' : 'Close'}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDialogHeader>
        <div className="space-y-6 py-4">
          {/* Personal Image */}
          {subscriber.personalImageUrl && (
            <div className="flex justify-center">
              <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted border-2 border-border">
                <Image
                  src={subscriber.personalImageUrl}
                  alt={subscriber.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'الاسم' : 'Name'}
              </label>
              <p className="text-base font-semibold">{subscriber.name}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'الجوال' : 'Mobile'}
              </label>
              <p className="text-base">{subscriber.mobile}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'المدينة' : 'City'}
              </label>
              <p className="text-base">{subscriber.city || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <p className="text-base">{subscriber.email}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'رقم الهوية' : 'ID Number'}
              </label>
              <p className="text-base font-mono">{subscriber.idNumber}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'الجنسية' : 'Nationality'}
              </label>
              <p className="text-base">
                {subscriber.nationality
                  ? isArabic
                    ? subscriber.nationality.nameAr
                    : subscriber.nationality.nameEn
                  : 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'العمر' : 'Age'}
              </label>
              <p className="text-base">{subscriber.age}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'الجنس' : 'Gender'}
              </label>
              <p className="text-base">
                {subscriber.gender
                  ? subscriber.gender === 'male'
                    ? (isArabic ? 'ذكر' : 'Male')
                    : (isArabic ? 'أنثى' : 'Female')
                  : 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'الحالة' : 'Status'}
              </label>
              {subscriber.accepted ? (
                <Badge variant="secondary" className="text-xs">
                  {isArabic ? 'مقبول' : 'Accepted'}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">{isArabic ? 'غير مقبول' : 'Not accepted'}</span>
              )}
            </div>
            {subscriber.dateOfBirth && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'تاريخ الميلاد' : 'Date of Birth'}
                </label>
                <p className="text-base">
                  {format(new Date(subscriber.dateOfBirth), 'PPP')}
                </p>
              </div>
            )}
            {subscriber.idExpiryDate && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'تاريخ انتهاء الهوية' : 'ID Expiry Date'}
                </label>
                <p className="text-base">
                  {format(new Date(subscriber.idExpiryDate), 'PPP')}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'تاريخ التسجيل' : 'Registration Date'}
              </label>
              <p className="text-base">
                {format(new Date(subscriber.createdAt), 'PPP')}
              </p>
            </div>
            {formattedIban && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'الآيبان' : 'IBAN'}
                </label>
                <p className="text-base font-mono break-words">{formattedIban}</p>
              </div>
            )}
            {subscriber.bankName && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'اسم البنك' : 'Bank Name'}
                </label>
                <p className="text-base">{subscriber.bankName}</p>
              </div>
            )}
            {subscriber.accountHolderName && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'اسم مالك الحساب' : 'Account Holder Name'}
                </label>
                <p className="text-base">{subscriber.accountHolderName}</p>
              </div>
            )}
          </div>

          {/* Job Requirement */}
          {subscriber.jobRequirement && (
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <label className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'الوظيفة المطلوبة' : 'Applied Job'}
                </label>
              </div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {subscriber.jobRequirement.job?.name || 'Unknown Job'}
                {subscriber.jobRequirement.ratePerDay != null && (
                  <span className="ml-2 font-semibold">
                    — {subscriber.jobRequirement.ratePerDay}{' '}
                    {isArabic ? 'ريال/يوم' : 'SAR/day'}
                  </span>
                )}
              </Badge>
            </div>
          )}

          {/* ID Image */}
          {subscriber.idImageUrl && (
            <div className="pt-4 border-t border-border/50">
              <label className="text-sm font-medium text-muted-foreground block mb-3">
                {isArabic ? 'صورة الهوية' : 'ID Image'}
              </label>
              <div className="relative h-64 w-full rounded-md overflow-hidden bg-muted border border-border/50">
                <Image
                  src={subscriber.idImageUrl}
                  alt={`${subscriber.name} ID`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

