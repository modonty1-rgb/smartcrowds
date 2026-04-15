'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const jobInputSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().optional().default(''),
});

export async function createJob(input: unknown) {
  const data = jobInputSchema.parse(input);
  const created = await prisma.job.create({ data });
  revalidatePath('/ar/dashboard/jobs');
  revalidatePath('/en/dashboard/jobs');
  return created;
}

export async function listJobs() {
  return prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getJob(id: string) {
  return prisma.job.findUnique({ where: { id } });
}

export async function updateJob(id: string, input: unknown) {
  const data = jobInputSchema.parse(input);
  const updated = await prisma.job.update({ where: { id }, data });
  revalidatePath('/ar/dashboard/jobs');
  revalidatePath('/en/dashboard/jobs');
  return updated;
}

export async function deleteJob(id: string) {
  // Disallow delete if used by any requirement
  const useCount = await prisma.eventJobRequirement.count({ where: { jobId: id } });
  if (useCount > 0) throw new Error('Job is in use by events');
  const deleted = await prisma.job.delete({ where: { id } });
  revalidatePath('/ar/dashboard/jobs');
  revalidatePath('/en/dashboard/jobs');
  return deleted;
}

// Translation mapping for common job titles
const jobTranslations: Record<string, string> = {
  'Inspector': 'مفتش',
  'Guard': 'حارس',
  'Traffic Regulator': 'منظم حركة مرور',
  'Traffic Supervisor': 'مشرف حركة مرور',
  'Event Leader': 'قائد فعالية',
  'Logistics': 'لوجستيك',
  'Control Room Supervisor': 'مسؤول غرفة تحكم',
  'Bodyguard': 'حارس شخصي',
  'Security and Safety Specialist': 'أخصائي أمن وسلامة',
  'Area Manager': 'مدير منطقة',
  'Project Manager': 'مدير مشروع',
  'Ticket Service Clerk': 'موظف خدمة تذاكر',
  'Permit Reader': 'قارئ تصاريح',
  'Sales Clerk': 'موظف مبيعات',
  'Logistics Manager': 'مدير لوجستيك',
  'Hostess (Protocol)': 'مضيف (بروتوكول)',
  'Hospitality Team Supervisor (Protocol)': 'مشرف فريق الضيافة (بروتوكول)',
  'Ticket Scanner': 'موظف مسح تذاكر',
  'Valley Driver': 'سائق وادي',
  'Vehicle Driver': 'سائق مركبة',
  'Inspection Supervisor': 'مشرف تفتيش',
  'Guard Supervisor': 'مشرف جارادات',
  'Organizer': 'منظم',
  'Organization Supervisor': 'مشرف تنظيم',
  'Organizers Supervisor': 'مشرف منظمين',
  'Parking Lot Driver': 'سائق صف سيارات',
  'Vehicle Leader': 'قائد مركبة',
};

// Function to translate English job name to Arabic
function translateJobName(englishName: string): string {
  // Check if exact match exists in translation map
  if (jobTranslations[englishName]) {
    return jobTranslations[englishName];
  }

  // Try case-insensitive match
  const lowerName = englishName.toLowerCase();
  for (const [key, value] of Object.entries(jobTranslations)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }

  // If no translation found, return empty string (will skip this job)
  return '';
}

export async function translateAllJobsToArabic() {
  try {
    // Fetch all jobs
    const allJobs = await prisma.job.findMany({
      select: {
        id: true,
        name: true,
        nameAr: true,
      },
    });

    // Filter jobs missing Arabic translation
    const jobsToTranslate = allJobs.filter(
      (job) => !job.nameAr || job.nameAr.trim() === ''
    );

    if (jobsToTranslate.length === 0) {
      return {
        success: true,
        message: 'All jobs already have Arabic translations',
        translated: 0,
        skipped: 0,
      };
    }

    let translated = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Translate and update each job
    for (const job of jobsToTranslate) {
      if (!job.name || job.name.trim() === '') {
        skipped++;
        errors.push(`Job ID ${job.id}: Empty English name, cannot translate`);
        continue;
      }

      const arabicTranslation = translateJobName(job.name.trim());

      if (!arabicTranslation) {
        skipped++;
        errors.push(`Job ID ${job.id} (${job.name}): No translation found`);
        continue;
      }

      try {
        await prisma.job.update({
          where: { id: job.id },
          data: { nameAr: arabicTranslation },
        });
        translated++;
      } catch (error) {
        skipped++;
        errors.push(
          `Job ID ${job.id} (${job.name}): ${error instanceof Error ? error.message : 'Update failed'}`
        );
      }
    }

    // Revalidate paths
    revalidatePath('/ar/dashboard/jobs');
    revalidatePath('/en/dashboard/jobs');

    return {
      success: true,
      message: `Translation completed: ${translated} translated, ${skipped} skipped`,
      translated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Error translating jobs to Arabic:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to translate jobs',
    };
  }
}


