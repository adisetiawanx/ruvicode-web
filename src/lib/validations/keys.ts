import { z } from "zod";

export const createKeySchema = z.object({
  label: z
    .string()
    .min(2, "Label must be at least 2 characters")
    .max(50, "Label is too long"),
  rateLimitRpm: z
    .number()
    .int("Must be a whole number")
    .min(1, "Must be at least 1")
    .max(1000000, "Maximum is 1,000,000 RPM"),
  spendLimitDaily: z
    .number()
    .positive("Must be greater than 0")
    .max(100000, "Maximum is $100,000")
    .nullable()
    .optional(),
  spendLimitMonthly: z
    .number()
    .positive("Must be greater than 0")
    .max(100000, "Maximum is $100,000")
    .nullable()
    .optional(),
});

export type CreateKeyInput = z.infer<typeof createKeySchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
