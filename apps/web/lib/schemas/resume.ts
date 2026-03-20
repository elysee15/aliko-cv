import { z } from "zod";

export const createResumeSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne doit pas dépasser 200 caractères"),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;

export const updateResumeSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne doit pas dépasser 200 caractères")
    .optional(),
  summary: z.string().max(2000).nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
