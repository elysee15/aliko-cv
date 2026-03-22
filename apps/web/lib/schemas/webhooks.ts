import { z } from "zod";

const webhookEventValues = [
  "resume.created",
  "resume.updated",
  "resume.deleted",
  "resume.published",
  "resume.exported",
  "application.created",
] as const;

export const createWebhookSchema = z.object({
  url: z
    .url("URL invalide")
    .refine((u) => u.startsWith("https://"), "L'URL doit utiliser HTTPS"),
  events: z
    .array(z.enum(webhookEventValues))
    .min(1, "Sélectionnez au moins un événement"),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;

export const deleteWebhookSchema = z.object({
  id: z.string().min(1),
});

export type DeleteWebhookInput = z.infer<typeof deleteWebhookSchema>;

export const toggleWebhookSchema = z.object({
  id: z.string().min(1),
  active: z.boolean(),
});

export type ToggleWebhookInput = z.infer<typeof toggleWebhookSchema>;
