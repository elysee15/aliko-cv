import { z } from "zod";

const applicationStatusValues = [
  "wishlist",
  "applied",
  "interview",
  "offer",
  "rejected",
  "archived",
] as const;

export const createApplicationSchema = z.object({
  company: z.string().min(1, "L'entreprise est requise").max(200),
  jobTitle: z.string().min(1, "Le poste est requis").max(200),
  jobUrl: z.string().url("URL invalide").max(500).nullable().optional(),
  status: z.enum(applicationStatusValues).optional(),
  appliedAt: z.string().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  resumeId: z.string().nullable().optional(),
  coverLetterId: z.string().nullable().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateApplicationSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1).max(200).optional(),
  jobTitle: z.string().min(1).max(200).optional(),
  jobUrl: z.string().url("URL invalide").max(500).nullable().optional(),
  status: z.enum(applicationStatusValues).optional(),
  appliedAt: z.string().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  resumeId: z.string().nullable().optional(),
  coverLetterId: z.string().nullable().optional(),
});

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const deleteApplicationSchema = z.object({
  id: z.string().min(1),
});

export type DeleteApplicationInput = z.infer<typeof deleteApplicationSchema>;
