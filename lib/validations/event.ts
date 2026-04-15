import { z } from 'zod';
// Simplified validations; Saudi ID check moved to basic pattern checks

// Schema for basic event creation (without requirements and jobs)
export const eventBasicSchema = z.object({
  title: z.string().min(2, 'Title is too short'),
  titleAr: z.string().min(2, 'Arabic title is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(2, 'Description is too short'),
  descriptionAr: z.string().min(2, 'Arabic description is required'),
  imageUrl: z.string().url().optional().or(z.literal('')).default(''),
  locationId: z.string().min(1, 'Location is required'),
});

export type EventBasicInput = z.infer<typeof eventBasicSchema>;

// Full schema for backward compatibility
export const eventInputSchema = z.object({
  title: z.string().min(2, 'Title is too short'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(2, 'Description is too short'),
  imageUrl: z.string().url().optional().or(z.literal('')).default(''),
  requirements: z.array(z.string().min(1)).default([]),
  locationId: z.string().min(1, 'Location is required'),
  jobs: z
    .array(
      z.object({
        jobId: z.string().min(1, 'Job is required'),
        ratePerDay: z.number().positive('Rate per day must be a positive number'),
      })
    )
    .default([]),
});

export type EventInput = z.infer<typeof eventInputSchema>;

// Schema for event job requirement
export const eventJobRequirementSchema = z.object({
  jobId: z.string().min(1, 'Job is required'),
  ratePerDay: z.coerce
    .number()
    .min(0, 'Rate per day must be at least 0'),
});

export type EventJobRequirementInput = z.infer<typeof eventJobRequirementSchema>;

// Schema for managing requirements and jobs together
export const eventRequirementsJobsSchema = z.object({
  requirements: z.array(z.string().min(1)).default([]),
  jobs: z.array(eventJobRequirementSchema).default([]),
});

// Schema for reading job requirement (allows null for existing data)
export const eventJobRequirementReadSchema = z.object({
  jobId: z.string().min(1, 'Job is required'),
  ratePerDay: z.number().min(0, 'Rate per day must be at least 0').nullable(),
});

export type EventRequirementsJobsInput = z.infer<typeof eventRequirementsJobsSchema>;

export const eventSchema = eventInputSchema.extend({
  id: z.string(),
  createdAt: z.number(),
});

export type EventItem = z.infer<typeof eventSchema>;

// Function to create registration schema with locale-aware messages
export function createRegistrationInputSchema(
  translations: {
    eventIdRequired: string;
    nameTooShort: string;
    mobileTooShort: string;
    invalidEmail: string;
    idNumberRequired: string;
    idNumberInvalid: string;
    idNumberNotString: string;
    nationalityRequired: string;
    agePositive: string;
    ageMin: string;
    ageMax: string;
    agreeRequired: string;
    idNumberDigitsOnly: string;
    idNumberLength: string;
    idNumberInvalidFormat: string;
    idNumberCheckDigit: string;
    jobRequired: string;
    idImageRequired: string;
    personalImageRequired: string;
    nameTooLong: string;
    mobileTooLong: string;
    emailTooLong: string;
    idExpiryRequired: string;
    ibanRequired: string;
    ibanInvalid: string;
    bankNameRequired: string;
    accountHolderRequired: string;
    genderRequired: string;
    cityRequired: string;
    cityTooShort: string;
    cityTooLong: string;
  },
  hasJobs: boolean = false
) {
  return z.object({
    eventId: z.string().min(1, translations.eventIdRequired),
    jobRequirementId: hasJobs 
      ? z.string().min(1, translations.jobRequired)
      : z.string().optional(),
    name: z.string().min(2, translations.nameTooShort).max(100, translations.nameTooLong),
    mobile: z.string().min(5, translations.mobileTooShort).max(15, translations.mobileTooLong),
    email: z.string().email(translations.invalidEmail).max(255, translations.emailTooLong),
    idNumber: z
      .string()
      .regex(/^[12][0-9]{9}$/, translations.idNumberInvalid),
    nationalityId: z.string().min(1, translations.nationalityRequired),
    dateOfBirth: z
      .string()
      .min(1, translations.ageMin)
      .superRefine((val, ctx) => {
        const date = new Date(val);
        if (Number.isNaN(date.getTime())) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: translations.ageMin });
          return;
        }
        const now = new Date();
        if (date > now) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: translations.ageMin });
          return;
        }
        const ageMs = now.getTime() - date.getTime();
        const ageYears = Math.floor(ageMs / (365.2425 * 24 * 60 * 60 * 1000));
        if (ageYears < 1) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: translations.ageMin });
        }
        if (ageYears > 150) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: translations.ageMax });
        }
      }),
    idImageUrl: z.string().min(1, translations.idImageRequired),
    personalImageUrl: z.string().min(1, translations.personalImageRequired),
    agreeToRequirements: z.boolean().refine((v) => v === true, { message: translations.agreeRequired }),
    idExpiryDate: z
      .string()
      .min(1, translations.idExpiryRequired)
      .superRefine((val, ctx) => {
        const date = new Date(val);
        if (Number.isNaN(date.getTime())) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: translations.idExpiryRequired });
          return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: translations.idExpiryRequired });
        }
      }),
    iban: z
      .string()
      .min(1, translations.ibanRequired)
      .superRefine((val, ctx) => {
        const sanitized = val.replace(/\s+/g, '').toUpperCase();
        if (!/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(sanitized)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: translations.ibanInvalid });
        }
      }),
    bankName: z.string().min(1, translations.bankNameRequired).max(100, translations.bankNameRequired),
    accountHolderName: z.string().min(1, translations.accountHolderRequired).max(100, translations.accountHolderRequired),
    gender: z
      .string()
      .min(1, translations.genderRequired)
      .refine((val) => ['male', 'female'].includes(val), { message: translations.genderRequired }),
    city: z.string().min(2, translations.cityTooShort).max(100, translations.cityTooLong),
  });
}

// Default schema (backward compatibility - uses English)
export const registrationInputSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  jobRequirementId: z.string().optional(),
  name: z.string().min(2, 'Name is too short'),
  mobile: z.string().min(5, 'Mobile number is too short'),
  email: z.string().email('Invalid email'),
  idNumber: z
    .string()
    .regex(/^[12][0-9]{9}$/,'Invalid ID number'),
  nationalityId: z.string().min(1, 'Nationality is required'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .superRefine((val, ctx) => {
      const date = new Date(val);
      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid date of birth' });
        return;
      }
      const now = new Date();
      if (date > now) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Date of birth cannot be in the future' });
        return;
      }
      const ageMs = now.getTime() - date.getTime();
      const ageYears = Math.floor(ageMs / (365.2425 * 24 * 60 * 60 * 1000));
      if (ageYears < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Age must be at least 1' });
      }
      if (ageYears > 150) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Age must be at most 150' });
      }
    }),
  idImageUrl: z.string().url().optional().or(z.literal('')).default(''),
  personalImageUrl: z.string().url().optional().or(z.literal('')).default(''),
  agreeToRequirements: z.boolean().refine((v) => v === true, { message: 'You must agree to the requirements' }),
  idExpiryDate: z
    .string()
    .min(1, 'ID expiry date is required')
    .superRefine((val, ctx) => {
      const date = new Date(val);
      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ID expiry date is required' });
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ID expiry date is required' });
      }
    }),
  iban: z
    .string()
    .min(1, 'IBAN is required')
    .superRefine((val, ctx) => {
      const sanitized = val.replace(/\s+/g, '').toUpperCase();
      if (!/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(sanitized)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid IBAN format' });
      }
    }),
  bankName: z.string().min(1, 'Bank name is required'),
  accountHolderName: z.string().min(1, 'Account holder name is required'),
  gender: z
    .string()
    .min(1, 'Gender is required')
    .refine((val) => ['male', 'female'].includes(val), { message: 'Gender is required' }),
  city: z.string().min(2, 'City name is too short').max(100, 'City name is too long'),
});

export type RegistrationInput = z.infer<typeof registrationInputSchema>;


