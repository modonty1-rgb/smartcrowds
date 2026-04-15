'use client';

import { z } from 'zod';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventRequirementsJobsSchema } from '@/lib/validations/event';
import { useTransition, useState, useEffect } from 'react';
import { updateEventRequirements, updateEventRequirementsAndJobs, addEventJob, updateEventJob, removeEventJob } from '@/app/actions/events/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from '@/lib/routing';
import { Check, X, Edit2 } from 'lucide-react';
import { showErrorSwal } from '@/lib/utils/swal';

type FormValues = { requirements: string[]; jobs: { jobId: string; ratePerDay: number }[] };

interface EventRequirementsJobsFormProps {
  eventId: string;
  jobs: { id: string; name: string }[];
  initialRequirements: string[];
  initialJobs: Array<{ id: string; jobId: string; ratePerDay: number | null; job: { id: string; name: string } }>;
  locale: string;
}

export default function EventRequirementsJobsForm({
  eventId,
  jobs,
  initialRequirements,
  initialJobs,
  locale,
}: EventRequirementsJobsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [savingRequirementIndex, setSavingRequirementIndex] = useState<number | null>(null);
  const [editingRequirementIndex, setEditingRequirementIndex] = useState<number | null>(null);
  const [savedRequirements, setSavedRequirements] = useState<Set<number>>(new Set());
  const [savingJobIndex, setSavingJobIndex] = useState<number | null>(null);
  const [editingJobIndex, setEditingJobIndex] = useState<number | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [jobDbIdMap, setJobDbIdMap] = useState<Map<number, string>>(new Map());
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(eventRequirementsJobsSchema) as any,
    defaultValues: {
      requirements: initialRequirements || [],
      jobs: initialJobs.map((j) => ({
        jobId: j.jobId,
        ratePerDay: j.ratePerDay ?? 0,
      })) || [],
    },
  });

  // Initialize job ID mapping
  useEffect(() => {
    const idMap = new Map<number, string>();
    initialJobs.forEach((j, index) => {
      if (j.id && j.jobId && j.ratePerDay != null && j.ratePerDay >= 0) {
        idMap.set(index, j.id);
      }
    });
    setJobDbIdMap(idMap);
  }, [initialJobs]);

  // Mark all initial requirements as saved
  useEffect(() => {
    const saved = new Set<number>();
    initialRequirements.forEach((_, index) => {
      if (initialRequirements[index] && initialRequirements[index].trim().length > 0) {
        saved.add(index);
      }
    });
    setSavedRequirements(saved);
  }, [initialRequirements]);

  // Mark all initial jobs as saved
  useEffect(() => {
    const saved = new Set<number>();
    initialJobs.forEach((_, index) => {
      if (
        initialJobs[index]?.jobId &&
        initialJobs[index]?.ratePerDay != null &&
        initialJobs[index]?.ratePerDay! >= 0
      ) {
        saved.add(index);
      }
    });
    setSavedJobs(saved);
  }, [initialJobs]);

  const requirementsArray = useFieldArray({
    control: form.control as any,
    name: 'requirements' as const,
  });

  const handleSaveRequirement = async (index: number) => {
    const requirement = form.watch(`requirements.${index}`);
    if (!requirement || requirement.trim().length === 0) {
      return;
    }

    setSavingRequirementIndex(index);
    const currentRequirements = form.getValues('requirements') ?? [];
    const validRequirements = currentRequirements.filter((r) => r && r.trim().length > 0);

    startTransition(async () => {
      const result = await updateEventRequirements(eventId, validRequirements);
      if (result.success) {
        setSavingRequirementIndex(null);
        setEditingRequirementIndex(null);
        setSavedRequirements(prev => new Set(prev).add(index));
        router.refresh();
      } else {
        setSavingRequirementIndex(null);
        showErrorSwal(result.error || 'Failed to save requirement', locale);
      }
    });
  };

  const handleEditRequirement = (index: number) => {
    setEditingRequirementIndex(index);
    setSavedRequirements(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleRemoveRequirement = (index: number) => {
    requirementsArray.remove(index);
    setSavedRequirements(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      // Adjust indices for items after the removed one
      const adjusted = new Set<number>();
      prev.forEach(savedIndex => {
        if (savedIndex < index) {
          adjusted.add(savedIndex);
        } else if (savedIndex > index) {
          adjusted.add(savedIndex - 1);
        }
      });
      return adjusted;
    });
    const currentRequirementsAll = (form.getValues('requirements') ?? []).filter((_, i) => i !== index);
    const validRequirements = currentRequirementsAll.filter((r) => r && r.trim().length > 0);
    
    startTransition(async () => {
      await updateEventRequirements(eventId, validRequirements);
      router.refresh();
    });
  };

  const handleAddRequirement = () => {
    const newIndex = requirementsArray.fields.length;
    requirementsArray.append('');
    // New requirement starts in edit mode
    setEditingRequirementIndex(newIndex);
  };

  const handleSaveJob = async (index: number) => {
    const job = form.watch(`jobs.${index}`);
    
    // Validate job data
    if (!job?.jobId || job.jobId.trim() === '') {
      form.setError(`jobs.${index}.jobId`, {
        type: 'manual',
        message: locale === 'ar' ? 'الوظيفة مطلوبة' : 'Job is required',
      });
      return;
    }
    
    const ratePerDay =
      typeof job.ratePerDay === 'number'
        ? job.ratePerDay
        : parseFloat(String(job.ratePerDay ?? 0));
    if (isNaN(ratePerDay) || ratePerDay < 0) {
      form.setError(`jobs.${index}.ratePerDay`, {
        type: 'manual',
        message:
          locale === 'ar'
            ? 'المعدل اليومي يجب أن يكون رقماً أكبر أو يساوي صفر'
            : 'Rate per day must be a number greater than or equal to 0',
      });
      return;
    }

    setSavingJobIndex(index);
    const dbId = jobDbIdMap.get(index);
    
    startTransition(async () => {
      try {
        let result;
        if (dbId) {
          // Update existing job
          result = await updateEventJob(dbId, ratePerDay);
        } else {
          // Create new job
          result = await addEventJob(eventId, job.jobId, ratePerDay);
        }
        
        if (result?.success) {
          setSavingJobIndex(null);
          setEditingJobIndex(null);
          setSavedJobs(prev => new Set(prev).add(index));
          // Clear any errors
          form.clearErrors();
          router.refresh();
        } else {
          setSavingJobIndex(null);
          const errorMsg = result?.error || 'Failed to save job';
          console.error('Save job error:', errorMsg);
          showErrorSwal(errorMsg, locale);
        }
      } catch (error) {
        setSavingJobIndex(null);
        console.error('Save job exception:', error);
        showErrorSwal(locale === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'An error occurred while saving', locale);
      }
    });
  };

  const handleEditJob = (index: number) => {
    setEditingJobIndex(index);
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleRemoveJob = async (index: number) => {
    const dbId = jobDbIdMap.get(index);
    
    if (dbId) {
      // Remove from database
      startTransition(async () => {
        await removeEventJob(dbId);
        router.refresh();
      });
    }
    
    // Remove from form
    jobsArray.remove(index);
    setSavedJobs(prev => {
      const adjusted = new Set<number>();
      prev.forEach(savedIndex => {
        if (savedIndex < index) {
          adjusted.add(savedIndex);
        } else if (savedIndex > index) {
          adjusted.add(savedIndex - 1);
        }
      });
      return adjusted;
    });
    setJobDbIdMap(prev => {
      const newMap = new Map<number, string>();
      prev.forEach((id, savedIndex) => {
        if (savedIndex < index) {
          newMap.set(savedIndex, id);
        } else if (savedIndex > index) {
          newMap.set(savedIndex - 1, id);
        }
      });
      return newMap;
    });
  };

  const handleAddJob = () => {
    const newIndex = jobsArray.fields.length;
    jobsArray.append({ jobId: '', ratePerDay: 0 });
    // New job starts in edit mode
    setEditingJobIndex(newIndex);
  };

  const jobsArray = useFieldArray({
    control: form.control as any,
    name: 'jobs' as const,
  });

  // Form submission is no longer needed since items save individually
  // Keeping the form structure for validation purposes
  const onSubmit: SubmitHandler<FormValues> = () => {
    // This is handled by individual save buttons now
    return;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const isRTL = locale === 'ar';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/events')}
        >
          {locale === 'ar' ? 'العودة للقائمة' : 'Back to List'}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {locale === 'ar' ? 'المتطلبات' : 'Requirements'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {locale === 'ar' 
                ? 'أضف متطلبات الفعالية' 
                : 'Add event requirements'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRequirement}
            >
              {locale === 'ar' ? 'إضافة' : 'Add'}
            </Button>
          </div>
          {requirementsArray.fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {locale === 'ar' 
                ? 'لا توجد متطلبات مضافة' 
                : 'No requirements added'}
            </p>
          )}
          {requirementsArray.fields.map((field, index) => {
            const requirementValue = form.watch(`requirements.${index}`);
            const isEmpty = !requirementValue || requirementValue.trim().length === 0;
            const isSaving = savingRequirementIndex === index;
            const isSaved = savedRequirements.has(index);
            const isEditing = editingRequirementIndex === index;
            const showSaveButton = isEditing || !isSaved;
            
            return (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  placeholder={
                    locale === 'ar' 
                      ? `المتطلب ${index + 1}` 
                      : `Requirement ${index + 1}`
                  }
                  {...form.register(`requirements.${index}` as const)}
                  className="flex-1"
                  disabled={isSaved && !isEditing}
                />
                {form.formState.errors.requirements?.[index] && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.requirements[index]?.message as string}
                  </p>
                )}
                <div className="flex items-center gap-1">
                  {showSaveButton ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleSaveRequirement(index)}
                      disabled={isEmpty || isSaving || isPending}
                      title={locale === 'ar' ? 'حفظ' : 'Save'}
                    >
                      {isSaving ? (
                        <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEditRequirement(index)}
                      disabled={isSaving || isPending}
                      title={locale === 'ar' ? 'تعديل' : 'Edit'}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveRequirement(index)}
                    disabled={isSaving || isPending}
                    title={locale === 'ar' ? 'حذف' : 'Remove'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {locale === 'ar' ? 'الوظائف والأدوار' : 'Jobs & Roles'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {locale === 'ar' 
                ? 'أضف الوظائف والأدوار المطلوبة للفعالية' 
                : 'Add jobs and roles required for the event'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddJob}
            >
              {locale === 'ar' ? 'إضافة وظيفة' : 'Add Job'}
            </Button>
          </div>
          {jobsArray.fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {locale === 'ar' 
                ? 'لا توجد وظائف مضافة' 
                : 'No jobs added'}
            </p>
          )}
          {jobsArray.fields.map((field, index) => {
            const jobValue = form.watch(`jobs.${index}`);
            const parsedRate =
              typeof jobValue?.ratePerDay === 'number'
                ? jobValue.ratePerDay
                : parseFloat(String(jobValue?.ratePerDay ?? 0));
            const isEmpty =
              !jobValue?.jobId ||
              jobValue?.ratePerDay == null ||
              Number.isNaN(parsedRate) ||
              parsedRate < 0;
            const isSaving = savingJobIndex === index;
            const isSaved = savedJobs.has(index);
            const isEditing = editingJobIndex === index;
            const showSaveButton = isEditing || !isSaved;
            
            return (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-start">
                <div className="md:col-span-3">
                  <select
                    className="w-full border rounded-md h-10 px-3 text-sm disabled:bg-muted disabled:cursor-not-allowed"
                    {...form.register(`jobs.${index}.jobId` as const)}
                    defaultValue=""
                    disabled={isSaved && !isEditing}
                  >
                    <option value="" disabled>
                      {locale === 'ar' ? 'اختر الوظيفة' : 'Select job'}
                    </option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.jobs?.[index]?.jobId && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.jobs[index]?.jobId?.message as string}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={
                      locale === 'ar' 
                        ? 'المعدل اليومي' 
                        : 'Rate per day'
                    }
                    {...form.register(`jobs.${index}.ratePerDay` as const, {
                      valueAsNumber: true,
                    })}
                    disabled={isSaved && !isEditing}
                  />
                  {form.formState.errors.jobs?.[index]?.ratePerDay && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.jobs[index]?.ratePerDay?.message as string}
                    </p>
                  )}
                </div>
                <div className="md:col-span-1 flex items-center gap-1">
                  {showSaveButton ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleSaveJob(index)}
                      disabled={isEmpty || isSaving || isPending}
                      title={locale === 'ar' ? 'حفظ' : 'Save'}
                    >
                      {isSaving ? (
                        <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEditJob(index)}
                      disabled={isSaving || isPending}
                      title={locale === 'ar' ? 'تعديل' : 'Edit'}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveJob(index)}
                    disabled={isSaving || isPending}
                    title={locale === 'ar' ? 'حذف' : 'Remove'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </form>
  );
}

