'use client';

import { useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Check, Trash2, Eye } from 'lucide-react';
import { updateContactMessageStatus, deleteContactMessage } from '../actions/actions';
import { useRouter } from '@/lib/routing';
import { showSuccessSwal, showErrorSwal } from '@/lib/utils/swal';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: Date | string;
}

interface ContactMessagesTableProps {
  messages: ContactMessage[];
  locale: string;
}

export function ContactMessagesTable({ messages, locale }: ContactMessagesTableProps) {
  const [isPending, startTransition] = useTransition();
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);
  const router = useRouter();
  const isArabic = locale === 'ar';
  const t = (en: string, ar: string) => (isArabic ? ar : en);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    startTransition(async () => {
      try {
        await updateContactMessageStatus(id, newStatus);
        showSuccessSwal(
          t('Status updated successfully', 'تم تحديث الحالة بنجاح'),
          locale
        );
        router.refresh();
      } catch (error) {
        showErrorSwal(
          t('Failed to update status', 'فشل تحديث الحالة'),
          locale
        );
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        await deleteContactMessage(id);
        showSuccessSwal(
          t('Message deleted successfully', 'تم حذف الرسالة بنجاح'),
          locale
        );
        router.refresh();
      } catch (error) {
        showErrorSwal(
          t('Failed to delete message', 'فشل حذف الرسالة'),
          locale
        );
      }
    });
  };

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    // Use UTC methods to ensure consistent formatting across server and client
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    
    if (locale === 'ar') {
      // Arabic format: DD/MM/YYYY HH:MM
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } else {
      // English format: MM/DD/YYYY HH:MM
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    }
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            {t('No messages found', 'لا توجد رسائل')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>
              {t('Name', 'الاسم')}
            </TableHead>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>
              {t('Email', 'البريد الإلكتروني')}
            </TableHead>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>
              {t('Phone', 'الهاتف')}
            </TableHead>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>
              {t('Message', 'الرسالة')}
            </TableHead>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>
              {t('Status', 'الحالة')}
            </TableHead>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>
              {t('Date', 'التاريخ')}
            </TableHead>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>
              {t('Actions', 'الإجراءات')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell className="font-medium">{message.name}</TableCell>
              <TableCell>
                <a
                  href={`mailto:${message.email}`}
                  className="text-primary hover:underline"
                >
                  {message.email}
                </a>
              </TableCell>
              <TableCell>{message.phone || t('N/A', 'غير متوفر')}</TableCell>
              <TableCell className="max-w-xs">
                <div className="truncate" title={message.message}>
                  {truncateMessage(message.message)}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={message.status === 'NEW' ? 'default' : 'secondary'}
                >
                  {message.status === 'NEW'
                    ? t('New', 'جديد')
                    : t('Read', 'مقروء')}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(message.createdAt)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingMessage(message)}
                    disabled={isPending}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {message.status === 'NEW' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(message.id, 'READ')}
                      disabled={isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {t('Mark as Read', 'تعليم كمقروء')}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(message.id, 'NEW')}
                      disabled={isPending}
                    >
                      {t('Mark as New', 'تعليم كجديد')}
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={isPending}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('Delete Message', 'حذف الرسالة')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t(
                            'Are you sure you want to delete this message? This action cannot be undone.',
                            'هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.'
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t('Cancel', 'إلغاء')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(message.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t('Delete', 'حذف')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!viewingMessage} onOpenChange={(open) => !open && setViewingMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t('Message Details', 'تفاصيل الرسالة')}
            </DialogTitle>
            <DialogDescription>
              {t('View full message details', 'عرض تفاصيل الرسالة الكاملة')}
            </DialogDescription>
          </DialogHeader>
          {viewingMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('Name', 'الاسم')}
                  </label>
                  <p className="mt-1">{viewingMessage.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('Email', 'البريد الإلكتروني')}
                  </label>
                  <p className="mt-1">
                    <a
                      href={`mailto:${viewingMessage.email}`}
                      className="text-primary hover:underline"
                    >
                      {viewingMessage.email}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('Phone', 'الهاتف')}
                  </label>
                  <p className="mt-1">
                    {viewingMessage.phone || t('N/A', 'غير متوفر')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('Status', 'الحالة')}
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={viewingMessage.status === 'NEW' ? 'default' : 'secondary'}
                    >
                      {viewingMessage.status === 'NEW'
                        ? t('New', 'جديد')
                        : t('Read', 'مقروء')}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('Date', 'التاريخ')}
                  </label>
                  <p className="mt-1">{formatDate(viewingMessage.createdAt)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('Message', 'الرسالة')}
                </label>
                <div className="mt-2 p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {viewingMessage.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

