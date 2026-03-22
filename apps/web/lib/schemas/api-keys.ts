import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis.")
    .max(100, "Maximum 100 caractères."),
  scope: z.enum(["read", "read_write"]).default("read"),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
