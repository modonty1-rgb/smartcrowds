'use server';

import { prisma } from '@/lib/prisma';
import { eventBasicSchema, eventInputSchema, registrationInputSchema, eventRequirementsJobsSchema, eventJobRequirementSchema } from '@/lib/validations/event';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import cloudinary from 'cloudinary';
import { initCloudinary } from '@/app/api/images/cloudinary/config';
import { Prisma } from '@prisma/client';

const subscriberUpdateSchema = registrationInputSchema
  .omit({ agreeToRequirements: true })
  .extend({
    id: z.string().min(1, 'Subscriber ID is required'),
  });

type SubscriberUpdateInput = z.infer<typeof subscriberUpdateSchema>;

const revalidateSubscriberPaths = (eventId: string) => {
  revalidatePath('/ar/events');
  revalidatePath('/en/events');
  revalidatePath(`/ar/events/${eventId}`);
  revalidatePath(`/en/events/${eventId}`);
  revalidatePath('/ar/dashboard/events');
  revalidatePath('/en/dashboard/events');
  revalidatePath(`/ar/dashboard/events/${eventId}/subscribers`);
  revalidatePath(`/en/dashboard/events/${eventId}/subscribers`);
  revalidatePath('/ar/dashboard/subscribers');
  revalidatePath('/en/dashboard/subscribers');
};

const sanitizeIban = (iban: string) => iban.replace(/\s+/g, '').toUpperCase();

const extractCloudinaryPublicId = (url?: string | null) => {
  if (!url) return null;
  const cleaned = url.split('?')[0];
  const match = cleaned.match(/\/upload\/(?:v\d+\/)?(.+)/);
  if (!match?.[1]) return null;
  const withoutExt = match[1].replace(/\.[^/.]+$/, '');
  return withoutExt;
};

const deleteCloudinaryAsset = async (url?: string | null) => {
  try {
    const publicId = extractCloudinaryPublicId(url);
    if (!publicId) return;
    const { error } = await initCloudinary();
    if (error) {
      console.error('Failed to init Cloudinary for delete:', error);
      return;
    }
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete Cloudinary asset', error);
  }
};
// Simplified ID validation handled inline

export async function createEvent(input: unknown) {
  const data = eventBasicSchema.parse(input);
  const created = await prisma.event.create({
    data: {
      title: data.title,
      titleAr: data.titleAr || undefined,
      description: data.description,
      descriptionAr: data.descriptionAr || undefined,
      date: new Date(data.date),
      imageUrl: data.imageUrl || undefined,
      requirements: [],
      locationId: data.locationId,
    } as unknown as Prisma.EventUncheckedCreateInput,
  });
  revalidatePath('/ar/dashboard/events');
  revalidatePath('/en/dashboard/events');
  return created;
}

export async function listEvents() {
  return prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      location: true,
      jobs: {
        include: { job: true },
      },
      subscribers: {
        select: {
          id: true,
          accepted: true,
        },
      },
    },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: { location: true, jobs: { include: { job: true } } },
  });
}

export async function getEventWithJobs(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      location: true,
      jobs: {
        include: { job: true },
        orderBy: { id: 'asc' }
      }
    },
  });
  return event;
}

export async function updateEventRequirements(
  eventId: string,
  requirements: Array<{ name: string; nameAr: string }> | string[]
) {
  try {
    // Convert objects to JSON strings for Prisma String[] field
    // Handle backward compatibility: if string[], keep as is; if objects, stringify
    const normalizedRequirements = requirements.map((req) => {
      if (typeof req === 'string') {
        return req;
      }
      // Serialize object to JSON string
      return JSON.stringify(req);
    });

    await prisma.event.update({
      where: { id: eventId },
      data: { requirements: normalizedRequirements },
    });
    revalidatePath('/ar/dashboard/events');
    revalidatePath('/en/dashboard/events');
    revalidatePath(`/ar/dashboard/events/${eventId}/requirements`);
    revalidatePath(`/en/dashboard/events/${eventId}/requirements`);
    revalidatePath(`/ar/dashboard/events/${eventId}/jobs`);
    revalidatePath(`/en/dashboard/events/${eventId}/jobs`);
    return { success: true };
  } catch (error) {
    console.error('Error updating event requirements:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update event requirements' };
  }
}

export async function addEventJob(eventId: string, jobId: string, ratePerDay: number) {
  try {
    const validated = eventJobRequirementSchema.parse({ jobId, ratePerDay });

    await prisma.eventJobRequirement.create({
      data: {
        eventId,
        jobId: validated.jobId,
        ratePerDay: validated.ratePerDay,
      },
    });

    revalidatePath('/ar/dashboard/events');
    revalidatePath('/en/dashboard/events');
    revalidatePath(`/ar/dashboard/events/${eventId}/jobs`);
    revalidatePath(`/en/dashboard/events/${eventId}/jobs`);
    return { success: true };
  } catch (error) {
    console.error('Error adding event job:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to add event job' };
  }
}

export async function updateEventJob(requirementId: string, ratePerDay: number) {
  try {
    if (ratePerDay == null || Number.isNaN(ratePerDay) || ratePerDay < 0) {
      return { error: 'Rate per day must be zero or greater' };
    }

    await prisma.eventJobRequirement.update({
      where: { id: requirementId },
      data: { ratePerDay },
    });

    const requirement = await prisma.eventJobRequirement.findUnique({
      where: { id: requirementId },
      include: { event: true },
    });

    if (requirement) {
      revalidatePath('/ar/dashboard/events');
      revalidatePath('/en/dashboard/events');
      revalidatePath(`/ar/dashboard/events/${requirement.eventId}/jobs`);
      revalidatePath(`/en/dashboard/events/${requirement.eventId}/jobs`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating event job:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update event job' };
  }
}

export async function removeEventJob(requirementId: string) {
  try {
    const requirement = await prisma.eventJobRequirement.findUnique({
      where: { id: requirementId },
      include: { event: true },
    });

    if (!requirement) {
      return { error: 'Event job requirement not found' };
    }

    await prisma.eventJobRequirement.delete({
      where: { id: requirementId },
    });

    revalidatePath('/ar/dashboard/events');
    revalidatePath('/en/dashboard/events');
    revalidatePath(`/ar/dashboard/events/${requirement.eventId}/jobs`);
    revalidatePath(`/en/dashboard/events/${requirement.eventId}/jobs`);

    return { success: true };
  } catch (error) {
    console.error('Error removing event job:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to remove event job' };
  }
}

export async function updateEventRequirementsAndJobs(eventId: string, data: unknown) {
  try {
    const validated = eventRequirementsJobsSchema.parse(data);

    // Update requirements
    await prisma.event.update({
      where: { id: eventId },
      data: { requirements: validated.requirements },
    });

    // Get existing jobs
    const existingJobs = (await prisma.eventJobRequirement.findMany({
      where: { eventId },
    })) as Array<{ id: string; jobId: string }>;

    // Remove jobs that are no longer in the list
    const existingJobIds = new Set(existingJobs.map((j: { jobId: string }) => j.jobId));
    const newJobIds = new Set((validated.jobs as Array<{ jobId: string; ratePerDay: number }>).map((j) => j.jobId));

    const jobsToRemove = existingJobs.filter((j: { jobId: string }) => !newJobIds.has(j.jobId));
    await Promise.all(
      jobsToRemove.map(job =>
        prisma.eventJobRequirement.delete({ where: { id: job.id } })
      )
    );

    // Update or create jobs
    await Promise.all(
      validated.jobs.map(async (job) => {
        const existing = existingJobs.find(j => j.jobId === job.jobId);
        if (existing) {
          // Update existing
          await prisma.eventJobRequirement.update({
            where: { id: existing.id },
            data: { ratePerDay: job.ratePerDay },
          });
        } else {
          // Create new
          await prisma.eventJobRequirement.create({
            data: {
              eventId,
              jobId: job.jobId,
              ratePerDay: job.ratePerDay,
            },
          });
        }
      })
    );

    revalidatePath('/ar/dashboard/events');
    revalidatePath('/en/dashboard/events');
    revalidatePath(`/ar/dashboard/events/${eventId}/jobs`);
    revalidatePath(`/en/dashboard/events/${eventId}/jobs`);

    return { success: true };
  } catch (error) {
    console.error('Error updating event requirements and jobs:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update event requirements and jobs' };
  }
}

export async function verifyIdNumber(eventId: string, idNumber: string) {
  try {
    // Simplified validation: 10 digits starting with 1 or 2
    if (!/^[12][0-9]{9}$/.test(idNumber)) {
      return {
        valid: false,
        isDuplicate: false,
        error: 'رقم الهوية غير صحيح',
      };
    }

    // Check for duplicate ID in database
    const existingSubscriber = await prisma.eventSubscriber.findFirst({
      where: {
        eventId,
        idNumber,
      },
    });

    if (existingSubscriber) {
      return {
        valid: true,
        isDuplicate: true,
        error: 'رقم الهوية هذا مسجل مسبقاً في هذه الفعالية. لا يمكن التسجيل مرتين بنفس رقم الهوية',
      };
    }

    return {
      valid: true,
      isDuplicate: false,
    };
  } catch (error) {
    console.error('Error verifying ID number:', error);
    return {
      valid: false,
      isDuplicate: false,
      error: error instanceof Error ? error.message : 'فشل التحقق من رقم الهوية',
    };
  }
}

export async function registerForEvent(input: unknown) {
  try {
    const data = registrationInputSchema.parse(input);

    // Check if this ID number is already registered for this event
    const existingSubscriber = await prisma.eventSubscriber.findFirst({
      where: {
        eventId: data.eventId,
        idNumber: data.idNumber,
      },
    });

    if (existingSubscriber) {
      return {
        error: 'رقم الهوية هذا مسجل مسبقاً في هذه الفعالية. لا يمكن التسجيل مرتين بنفس رقم الهوية'
      };
    }

    // Compute age from date of birth
    const dob = new Date(data.dateOfBirth);
    const idExpiry = new Date(data.idExpiryDate);
    const now = new Date();
    const ageMs = now.getTime() - dob.getTime();
    const computedAge = Math.floor(ageMs / (365.2425 * 24 * 60 * 60 * 1000));
    const sanitizedIban = data.iban.replace(/\s+/g, '').toUpperCase();

    const subscriber = await prisma.eventSubscriber.create({
      data: {
        eventId: data.eventId,
        jobRequirementId: data.jobRequirementId || undefined,
        nationalityId: data.nationalityId,
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        idNumber: data.idNumber,
        age: computedAge,
        dateOfBirth: dob,
        idImageUrl: data.idImageUrl || undefined,
        personalImageUrl: data.personalImageUrl || undefined,
        idExpiryDate: idExpiry,
        iban: sanitizedIban,
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        gender: data.gender,
        city: data.city || undefined,
      },
    });

    revalidatePath('/ar/events');
    revalidatePath('/en/events');
    revalidatePath(`/ar/events/${data.eventId}`);
    revalidatePath(`/en/events/${data.eventId}`);
    revalidatePath('/ar/dashboard/events');
    revalidatePath('/en/dashboard/events');
    revalidatePath(`/ar/dashboard/events/${data.eventId}/subscribers`);
    revalidatePath(`/en/dashboard/events/${data.eventId}/subscribers`);
    revalidatePath('/ar/dashboard/subscribers');
    revalidatePath('/en/dashboard/subscribers');

    return { success: true, subscriber };
  } catch (error) {
    console.error('Error registering for event:', error);

    // Handle Prisma unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return {
        error: 'رقم الهوية هذا مسجل مسبقاً في هذه الفعالية. لا يمكن التسجيل مرتين بنفس رقم الهوية'
      };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to register for event' };
  }
}

export async function listEventSubscribers(eventId: string, acceptedOnly: boolean = false) {
  try {
    const subscribers = await prisma.eventSubscriber.findMany({
      where: { eventId, accepted: acceptedOnly ? true : undefined },
      include: {
        jobRequirement: {
          include: {
            job: true,
          },
        },
        nationality: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return subscribers;
  } catch (error) {
    console.error('Error listing event subscribers:', error);
    return [];
  }
}
export async function updateSubscriberAccepted(subscriberId: string, accepted: boolean) {
  try {
    const updated = await prisma.eventSubscriber.update({
      where: { id: subscriberId },
      data: { accepted },
    });
    revalidatePath('/ar/dashboard/events');
    revalidatePath('/en/dashboard/events');
    revalidatePath(`/ar/dashboard/events/${updated.eventId}/subscribers`);
    revalidatePath(`/en/dashboard/events/${updated.eventId}/subscribers`);
    return { success: true };
  } catch (error) {
    console.error('Error updating subscriber accepted:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update subscriber accepted' };
  }
}

export async function bulkUpdateSubscribersAccepted(ids: string[], accepted: boolean) {
  try {
    const subs = (await prisma.eventSubscriber.findMany({
      where: { id: { in: ids } },
      select: { eventId: true },
    })) as Array<{ eventId: string }>;
    if (subs.length === 0) return { success: true };
    await prisma.eventSubscriber.updateMany({ where: { id: { in: ids } }, data: { accepted } });
    const eventIds = Array.from(new Set(subs.map((s: { eventId: string }) => s.eventId)));
    revalidatePath('/ar/dashboard/events');
    revalidatePath('/en/dashboard/events');
    for (const eid of eventIds as string[]) {
      revalidatePath(`/ar/dashboard/events/${eid}/subscribers`);
      revalidatePath(`/en/dashboard/events/${eid}/subscribers`);
    }
    return { success: true };
  } catch (error) {
    console.error('Error bulk updating subscriber accepted:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to bulk update subscriber accepted' };
  }
}

export async function exportEventSubscribersToCSV(eventId: string) {
  try {
    const subscribers = await prisma.eventSubscriber.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            title: true,
          },
        },
        jobRequirement: {
          include: {
            job: true,
          },
        },
        nationality: true,
      },
    });

    if (subscribers.length === 0) {
      return { error: 'No subscribers to export' };
    }

    // CSV Headers
    const headers = [
      'Name',
      'Mobile',
      'Email',
      'ID Number',
      'ID Expiry Date',
      'Nationality',
      'Age',
      'Job',
      'Rate Per Day',
      'IBAN',
      'Bank Name',
      'Account Holder Name',
      'Gender',
      'ID Image URL',
      'Personal Image URL',
      'Registration Date',
    ];

    // CSV Rows
    type CsvSub = {
      name: string; mobile: string; email: string; idNumber: string; age: number;
      jobRequirement?: { job?: { name?: string | null } | null; ratePerDay?: number | null } | null;
      idImageUrl?: string | null; personalImageUrl?: string | null; createdAt: Date | string;
      nationality?: { nameEn?: string | null } | null;
      idExpiryDate?: Date | string | null;
      iban?: string | null;
      bankName?: string | null;
      accountHolderName?: string | null;
      gender?: string | null;
    };
    const rows = (subscribers as unknown as CsvSub[]).map((subscriber) => [
      subscriber.name,
      subscriber.mobile,
      subscriber.email,
      subscriber.idNumber,
      subscriber.idExpiryDate ? new Date(subscriber.idExpiryDate).toISOString().split('T')[0] : '',
      subscriber.nationality ? subscriber.nationality.nameEn : '',
      subscriber.age.toString(),
      subscriber.jobRequirement?.job?.name || '',
      subscriber.jobRequirement?.ratePerDay?.toString() || '',
      subscriber.iban || '',
      subscriber.bankName || '',
      subscriber.accountHolderName || '',
      subscriber.gender || '',
      subscriber.idImageUrl || '',
      subscriber.personalImageUrl || '',
      new Date(subscriber.createdAt).toISOString(),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // Add BOM for UTF-8 to support Arabic characters in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    return { success: true, csv: csvWithBOM };
  } catch (error) {
    console.error('Error exporting subscribers to CSV:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to export subscribers to CSV' };
  }
}

export async function listAllSubscribers() {
  try {
    const subscribers = await prisma.eventSubscriber.findMany({
      include: {
        event: {
          select: {
            title: true,
          },
        },
        jobRequirement: {
          include: {
            job: true,
          },
        },
        nationality: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return subscribers;
  } catch (error) {
    console.error('Error listing all subscribers:', error);
    return [];
  }
}

export async function getEventSubscriber(eventId: string, subscriberId: string) {
  try {
    return await prisma.eventSubscriber.findFirst({
      where: { id: subscriberId, eventId },
      include: {
        jobRequirement: {
          include: { job: true },
        },
        nationality: true,
      },
    });
  } catch (error) {
    console.error('Error retrieving event subscriber:', error);
    return null;
  }
}

export async function updateEventSubscriber(input: unknown) {
  try {
    const data = subscriberUpdateSchema.parse(input);
    const existing = await prisma.eventSubscriber.findUnique({
      where: { id: data.id },
      select: {
        eventId: true,
        idNumber: true,
        idImageUrl: true,
        personalImageUrl: true,
      },
    });

    if (!existing) {
      return { error: 'Subscriber not found' };
    }

    if (existing.eventId !== data.eventId) {
      return { error: 'Subscriber does not belong to this event' };
    }

    const duplicate = await prisma.eventSubscriber.findFirst({
      where: {
        eventId: data.eventId,
        idNumber: data.idNumber,
        NOT: { id: data.id },
      },
      select: { id: true },
    });

    if (duplicate) {
      return {
        error: 'رقم الهوية هذا مسجل مسبقاً في هذه الفعالية. لا يمكن التسجيل مرتين بنفس رقم الهوية',
      };
    }

    const dob = new Date(data.dateOfBirth);
    const idExpiry = new Date(data.idExpiryDate);
    const now = new Date();
    const ageYears = Math.floor((now.getTime() - dob.getTime()) / (365.2425 * 24 * 60 * 60 * 1000));
    const sanitizedIban = sanitizeIban(data.iban);

    const updatePayload: Prisma.EventSubscriberUpdateInput = {
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      idNumber: data.idNumber,
      nationality: { connect: { id: data.nationalityId } },
      age: ageYears,
      dateOfBirth: dob,
      idExpiryDate: idExpiry,
      iban: sanitizedIban,
      bankName: data.bankName,
      accountHolderName: data.accountHolderName,
      gender: data.gender,
      city: data.city || null,
      idImageUrl: data.idImageUrl || null,
      personalImageUrl: data.personalImageUrl || null,
      jobRequirement:
        data.jobRequirementId && data.jobRequirementId.length > 0
          ? { connect: { id: data.jobRequirementId } }
          : { disconnect: true },
    };

    const updated = await prisma.eventSubscriber.update({
      where: { id: data.id },
      data: updatePayload,
    });

    if (existing.idImageUrl && existing.idImageUrl !== data.idImageUrl) {
      await deleteCloudinaryAsset(existing.idImageUrl);
    }
    if (existing.personalImageUrl && existing.personalImageUrl !== data.personalImageUrl) {
      await deleteCloudinaryAsset(existing.personalImageUrl);
    }

    revalidateSubscriberPaths(data.eventId);

    return { success: true, subscriber: updated };
  } catch (error) {
    console.error('Error updating event subscriber:', error);
    if (error instanceof z.ZodError) {
      return { error: error.issues?.[0]?.message || 'Validation failed' };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        error: 'رقم الهوية هذا مسجل مسبقاً في هذه الفعالية. لا يمكن التسجيل مرتين بنفس رقم الهوية',
      };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update subscriber' };
  }
}

export async function deleteEventSubscriber(subscriberId: string) {
  try {
    const subscriber = await prisma.eventSubscriber.findUnique({
      where: { id: subscriberId },
      select: {
        eventId: true,
        idImageUrl: true,
        personalImageUrl: true,
      },
    });

    if (!subscriber) {
      return { error: 'Subscriber not found' };
    }

    await prisma.eventSubscriber.delete({ where: { id: subscriberId } });

    await Promise.all([
      deleteCloudinaryAsset(subscriber.idImageUrl),
      deleteCloudinaryAsset(subscriber.personalImageUrl),
    ]);

    revalidateSubscriberPaths(subscriber.eventId);

    return { success: true };
  } catch (error) {
    console.error('Error deleting event subscriber:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to delete subscriber' };
  }
}

export async function updateEventPublished(eventId: string, published: boolean) {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: { published },
    });
    revalidatePath('/ar/dashboard/events');
    revalidatePath('/en/dashboard/events');
    return { success: true };
  } catch (error) {
    console.error('Error updating event published status:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update event published status' };
  }
}

export async function updateEventAcceptJobs(eventId: string, acceptJobs: boolean) {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: { acceptJobs },
    });
    revalidatePath('/ar/dashboard/events');
    revalidatePath('/en/dashboard/events');
    return { success: true };
  } catch (error) {
    console.error('Error updating event accept jobs status:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update event accept jobs status' };
  }
}

export async function updateEventCompleted(eventId: string, completed: boolean) {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: { completed },
    });
    revalidatePath('/ar/dashboard/events');
    revalidatePath('/en/dashboard/events');
    return { success: true };
  } catch (error) {
    console.error('Error updating event completed status:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update event completed status' };
  }
}


// Update event core fields
const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  titleAr: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  descriptionAr: z.string().min(1).optional(),
  date: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')).optional(),
  locationId: z.string().optional(),
  acceptJobs: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function updateEvent(eventId: string, input: unknown) {
  try {
    const data = updateEventSchema.parse(input);
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.titleAr !== undefined) updateData.titleAr = data.titleAr || null;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.descriptionAr !== undefined) updateData.descriptionAr = data.descriptionAr || null;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
    if (data.locationId !== undefined) updateData.locationId = data.locationId;
    if (data.acceptJobs !== undefined) updateData.acceptJobs = data.acceptJobs;
    if (data.published !== undefined) updateData.published = data.published;

    await prisma.event.update({ where: { id: eventId }, data: updateData });

    // Revalidate dashboards and public pages
    revalidatePath('/ar/dashboard/events');
    revalidatePath('/en/dashboard/events');
    revalidatePath(`/ar/dashboard/events/${eventId}/jobs`);
    revalidatePath(`/en/dashboard/events/${eventId}/jobs`);
    revalidatePath('/ar/events');
    revalidatePath('/en/events');
    revalidatePath(`/ar/events/${eventId}`);
    revalidatePath(`/en/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update event' };
  }
}


