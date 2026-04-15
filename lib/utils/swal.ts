import Swal from 'sweetalert2';

interface SwalOptions {
  title?: string;
  text: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
}

export function showSwal(options: SwalOptions, locale: string = 'en') {
  const isArabic = locale === 'ar';
  
  const defaultOptions = {
    confirmButtonText: isArabic ? 'حسناً' : 'OK',
    cancelButtonText: isArabic ? 'إلغاء' : 'Cancel',
    confirmButtonColor: '#3b82f6',
    ...options,
  };

  return Swal.fire(defaultOptions);
}

export function showSuccessSwal(text: string, locale: string = 'en') {
  return showSwal({
    text,
    icon: 'success',
    title: locale === 'ar' ? 'نجح' : 'Success',
  }, locale);
}

export function showErrorSwal(text: string, locale: string = 'en') {
  return showSwal({
    text,
    icon: 'error',
    title: locale === 'ar' ? 'خطأ' : 'Error',
  }, locale);
}

export function showWarningSwal(text: string, locale: string = 'en') {
  return showSwal({
    text,
    icon: 'warning',
    title: locale === 'ar' ? 'تحذير' : 'Warning',
  }, locale);
}

export function showConfirmSwal(
  text: string,
  onConfirm: () => void | Promise<void>,
  locale: string = 'en'
) {
  const isArabic = locale === 'ar';
  
  return Swal.fire({
    title: isArabic ? 'هل أنت متأكد؟' : 'Are you sure?',
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#ef4444',
    confirmButtonText: isArabic ? 'نعم' : 'Yes',
    cancelButtonText: isArabic ? 'لا' : 'No',
  }).then((result) => {
    if (result.isConfirmed) {
      return onConfirm();
    }
  });
}

