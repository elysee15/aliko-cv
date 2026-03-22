"use server";

import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  createWebhook,
  deleteWebhook,
  toggleWebhook,
  getWebhooksByUser,
} from "@aliko-cv/db/queries";

import { authClient, ActionError } from "@/lib/safe-action";
import {
  createWebhookSchema,
  deleteWebhookSchema,
  toggleWebhookSchema,
} from "@/lib/schemas/webhooks";

export const createWebhookAction = authClient
  .inputSchema(createWebhookSchema)
  .action(async ({ parsedInput, ctx }) => {
    const existing = await getWebhooksByUser(db, ctx.user.id);
    if (existing.length >= 5) {
      throw new ActionError("Maximum 5 webhooks. Supprimez-en un d'abord.");
    }

    const secret = `whsec_${Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`;

    const hook = await createWebhook(db, {
      userId: ctx.user.id,
      url: parsedInput.url,
      secret,
      events: parsedInput.events,
    });

    revalidatePath("/dashboard/settings/integrations");
    return { id: hook.id, secret };
  });

export const deleteWebhookAction = authClient
  .inputSchema(deleteWebhookSchema)
  .action(async ({ parsedInput, ctx }) => {
    const hook = await deleteWebhook(db, parsedInput.id, ctx.user.id);
    if (!hook) throw new ActionError("Webhook introuvable.");

    revalidatePath("/dashboard/settings/integrations");
    return { id: hook.id };
  });

export const toggleWebhookAction = authClient
  .inputSchema(toggleWebhookSchema)
  .action(async ({ parsedInput, ctx }) => {
    const hook = await toggleWebhook(
      db,
      parsedInput.id,
      ctx.user.id,
      parsedInput.active,
    );
    if (!hook) throw new ActionError("Webhook introuvable.");

    revalidatePath("/dashboard/settings/integrations");
    return { id: hook.id };
  });
