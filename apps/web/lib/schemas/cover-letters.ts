import { z } from "zod";

export const createCoverLetterSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200),
  resumeId: z.string().nullable().optional(),
  company: z.string().max(200).nullable().optional(),
  jobTitle: z.string().max(200).nullable().optional(),
});

export type CreateCoverLetterInput = z.infer<typeof createCoverLetterSchema>;

export const updateCoverLetterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  resumeId: z.string().nullable().optional(),
  company: z.string().max(200).nullable().optional(),
  jobTitle: z.string().max(200).nullable().optional(),
  content: z.string().max(50000).optional(),
});

export type UpdateCoverLetterInput = z.infer<typeof updateCoverLetterSchema>;

export const deleteCoverLetterSchema = z.object({
  id: z.string().min(1),
});

export type DeleteCoverLetterInput = z.infer<typeof deleteCoverLetterSchema>;
