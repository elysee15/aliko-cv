import { z } from "zod";

export const updatePortfolioSchema = z.object({
  enabled: z.boolean().optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide")
    .optional(),
  headline: z.string().max(200).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
});

export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
