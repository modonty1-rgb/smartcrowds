'use client';

import { useMemo, useState, useTransition } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Eye, Check, X as XIcon, Loader2, Trash2, PenSquare } from 'lucide-react';
import { format } from 'date-fns';
import { SubscriberDetailDialog } from './SubscriberDetailDialog';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Link } from '@/lib/routing';
import {
  updateSubscriberAccepted,
  bulkUpdateSubscribersAccepted,
  deleteEventSubscriber,
} from '@/app/actions/events/actions';
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
import { showSuccessSwal } from '@/lib/utils/swal';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SubscribersTableProps {
  subscribers: Array<{
    id: string;
    name: string;
    mobile: string;
    email: string;
    idNumber: string;
    age: number;
    accepted?: boolean;
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
    idExpiryDate?: Date | string | null;
    iban?: string | null;
    bankName?: string | null;
    accountHolderName?: string | null;
    gender?: string | null;
    city?: string | null;
  }>;
  locale: string;
  eventId: string;
}

export function SubscribersTable({
  subscribers,
  locale,
  eventId,
}: SubscribersTableProps) {
  const [selectedSubscriber, setSelectedSubscriber] = useState<
    SubscribersTableProps['subscribers'][0] | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubscribersTableProps['subscribers'][0] | null>(
    null,
  );
  const [deleteLoading, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string>('');
  const [filterTerm, setFilterTerm] = useState('');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [pendingJobFilter, setPendingJobFilter] = useState<string>('all');
  const isArabic = locale === 'ar';
  const router = useRouter();

  const normalizedFilter = filterTerm.trim().toLowerCase();

  const jobOptions = useMemo(() => {
    const uniqueJobs = new Map<string, string>();
    let hasUnassigned = false;

    for (const subscriber of subscribers) {
      const jobRequirementId = subscriber.jobRequirement?.id;
      const jobName = subscriber.jobRequirement?.job?.name;

      if (jobRequirementId && jobName) {
        if (!uniqueJobs.has(jobRequirementId)) {
          uniqueJobs.set(jobRequirementId, jobName);
        }
      } else {
        hasUnassigned = true;
      }
    }

    const options = Array.from(uniqueJobs.entries()).map(([requirementId, name]) => ({
      id: requirementId,
      name,
    }));

    if (hasUnassigned) {
      options.unshift({ id: 'none', name: isArabic ? 'بدون وظيفة' : 'No job' });
    }

    return options;
  }, [isArabic, subscribers]);

  const filteredSubscribers = useMemo(() => {
    let result = subscribers;

    if (jobFilter !== 'all') {
      result = result.filter((subscriber) => {
        const jobRequirementId = subscriber.jobRequirement?.id;
        if (jobFilter === 'none') {
          return !jobRequirementId;
        }
        return jobRequirementId === jobFilter;
      });
    }

    if (!normalizedFilter) return result;
    return result.filter((subscriber) => {
      const haystacks = [
        subscriber.name,
        subscriber.mobile,
        subscriber.idNumber,
        subscriber.city,
      ];
      return haystacks.some((value) =>
        value?.toLowerCase().includes(normalizedFilter),
      );
    });
  }, [jobFilter, normalizedFilter, subscribers]);
  const applyButtonApplied = pendingJobFilter === jobFilter;

  const allSelected =
    filteredSubscribers.length > 0 &&
    filteredSubscribers.every((subscriber) => selectedIds.has(subscriber.id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filteredSubscribers.forEach((subscriber) => next.delete(subscriber.id));
      } else {
        filteredSubscribers.forEach((subscriber) => next.add(subscriber.id));
      }
      return next;
    });
  };
  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkAccept = async (accepted: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkUpdating(true);
    await bulkUpdateSubscribersAccepted(ids, accepted);
    setBulkUpdating(false);
    setSelectedIds(new Set());
  };

  const handleViewMore = (subscriber: SubscribersTableProps['subscribers'][0]) => {
    setSelectedSubscriber(subscriber);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleteError('');
    startDeleteTransition(async () => {
      const result = await deleteEventSubscriber(deleteTarget.id);
      if (result?.error) {
        setDeleteError(result.error);
        return;
      }
      showSuccessSwal(
        isArabic ? 'تم حذف المشترك بنجاح' : 'Subscriber deleted successfully',
        locale,
      );
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setDeleteError('');
      router.refresh();
    });
  };

  return (
    <>
      <Card>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={filterTerm}
            onChange={(event) => setFilterTerm(event.target.value)}
            placeholder={
              isArabic ? 'ابحث بالاسم أو رقم الجوال أو الهوية' : 'Search by name, mobile, or ID'
            }
            aria-label={isArabic ? 'بحث المشتركين' : 'Search subscribers'}
            dir={isArabic ? 'rtl' : 'ltr'}
            className="w-full sm:max-w-xs"
          />
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Select value={pendingJobFilter} onValueChange={setPendingJobFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue
                  placeholder={isArabic ? 'كل الوظائف' : 'All jobs'}
                  aria-label={isArabic ? 'تصفية حسب الوظيفة' : 'Filter by job'}
                />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">
                  {isArabic ? 'كل الوظائف' : 'All jobs'}
                </SelectItem>
                {jobOptions.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setJobFilter(pendingJobFilter)}
              disabled={applyButtonApplied}
              className="sm:w-auto"
            >
              {applyButtonApplied ? (
                isArabic ? 'مطبقة' : 'Applied'
              ) : (
                isArabic ? 'تطبيق' : 'Apply'
              )}
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] text-center">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </TableHead>
                <TableHead className={`w-[60px] ${isArabic ? 'text-right' : 'text-left'}`}>
                  {isArabic ? 'الصورة' : 'Photo'}
                </TableHead>
                <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                  {isArabic ? 'الاسم' : 'Name'}
                </TableHead>
                <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                  {isArabic ? 'الجوال' : 'Mobile'}
                </TableHead>
                <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                  {isArabic ? 'المدينة' : 'City'}
                </TableHead>
                <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                  {isArabic ? 'الجنسية' : 'Nationality'}
                </TableHead>
                <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                  {isArabic ? 'الوظيفة' : 'Job'}
                </TableHead>
                <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                  {isArabic ? 'مقبول' : 'Accepted'}
                </TableHead>
                <TableHead className="w-[120px] text-center">
                  {isArabic ? 'الإجراءات' : 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    {filterTerm
                      ? isArabic
                        ? 'لا توجد نتائج مطابقة للبحث'
                        : 'No subscribers match your search'
                      : isArabic
                        ? 'لا يوجد مشتركين'
                        : 'No subscribers'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <TableRow
                    key={subscriber.id}
                    className={[
                      selectedIds.has(subscriber.id) ? 'bg-green-50 dark:bg-green-900/20' : '',
                      subscriber.accepted ? 'bg-emerald-50/70 dark:bg-emerald-900/20 border-l-4 border-emerald-500 ring-1 ring-emerald-200/60 dark:ring-emerald-800/50' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(subscriber.id)}
                        onChange={() => toggleSelectOne(subscriber.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {subscriber.personalImageUrl ? (
                        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={subscriber.personalImageUrl}
                            alt={subscriber.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          {subscriber.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{subscriber.name}</TableCell>
                    <TableCell>{subscriber.mobile}</TableCell>
                    <TableCell>{subscriber.city || 'N/A'}</TableCell>
                    <TableCell>
                      {subscriber.nationality
                        ? isArabic
                          ? subscriber.nationality.nameAr
                          : subscriber.nationality.nameEn
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {subscriber.jobRequirement?.job ? (
                        <Badge variant="secondary" className="text-xs">
                          {subscriber.jobRequirement.job.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            setUpdatingId(subscriber.id);
                            await updateSubscriberAccepted(subscriber.id, !subscriber.accepted);
                            setUpdatingId(null);
                          }}
                          title={subscriber.accepted ? (isArabic ? 'إلغاء القبول' : 'Unaccept') : (isArabic ? 'تعيين مقبول' : 'Mark accepted')}
                          disabled={updatingId === subscriber.id || bulkUpdating}
                        >
                          {updatingId === subscriber.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : subscriber.accepted ? (
                            <XIcon className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewMore(subscriber)}
                          className="flex-1"
                        >
                          <Eye className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                          {isArabic ? 'عرض المزيد' : 'View More'}
                        </Button>
                        <Link href={`/dashboard/events/${eventId}/subscribers/${subscriber.id}/edit`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <PenSquare className="h-3 w-3" />
                            {isArabic ? 'تعديل' : 'Edit'}
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => {
                            setDeleteTarget(subscriber);
                            setDeleteDialogOpen(true);
                            setDeleteError('');
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                          {isArabic ? 'حذف' : 'Delete'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 p-3 border-t">
            <span className="text-sm text-muted-foreground">
              {isArabic ? 'المحدد:' : 'Selected:'} {selectedIds.size}
            </span>
            <Button variant="outline" size="sm" onClick={() => handleBulkAccept(true)} disabled={bulkUpdating}>
              {bulkUpdating ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              {isArabic ? 'تعيين مقبول' : 'Mark accepted'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAccept(false)} disabled={bulkUpdating}>
              {bulkUpdating ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <XIcon className="h-4 w-4 mr-1" />
              )}
              {isArabic ? 'إلغاء القبول' : 'Unaccept'}
            </Button>
          </div>
        )}
      </Card>

      <SubscriberDetailDialog
        subscriber={selectedSubscriber}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        locale={locale}
      />

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
            setDeleteError('');
          } else if (!deleteLoading) {
            setDeleteDialogOpen(true);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isArabic ? 'تأكيد الحذف' : 'Confirm Deletion'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? 'هل أنت متأكد من رغبتك في حذف هذا المشترك؟ لا يمكن التراجع عن هذه الخطوة.'
                : 'Are you sure you want to delete this subscriber? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isArabic ? 'جاري الحذف...' : 'Deleting...'}
                </span>
              ) : (
                <>{isArabic ? 'تأكيد الحذف' : 'Delete'}</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

