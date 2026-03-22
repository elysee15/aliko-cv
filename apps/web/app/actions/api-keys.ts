"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  createApiKey,
  revokeApiKey,
  getApiKeysByUser,
} from "@aliko-cv/db/queries";

import { authClient, ActionError } from "@/lib/safe-action";
import { createApiKeySchema } from "@/lib/schemas/api-keys";

const MAX_ACTIVE_API_KEYS = 5;

export const createApiKeyAction = authClient
  .inputSchema(createApiKeySchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await db.transaction(async (tx) => {
      const existing = await getApiKeysByUser(tx, ctx.user.id);
      if (existing.length >= MAX_ACTIVE_API_KEYS) {
        throw new ActionError("Maximum 5 clés API actives.");
      }
      return createApiKey(tx, ctx.user.id, parsedInput.name, parsedInput.scope);
    });

    console.info(
      JSON.stringify({
        event: "api_key.created",
        userId: ctx.user.id,
        keyPrefix: result.key.keyPrefix,
        timestamp: new Date().toISOString(),
      }),
    );

    revalidatePath("/dashboard/settings/integrations");
    return { rawKey: result.rawKey };
  });

export const revokeApiKeyAction = authClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const key = await revokeApiKey(db, parsedInput.id, ctx.user.id);
    if (!key) {
      throw new ActionError("Clé introuvable.");
    }

    console.info(
      JSON.stringify({
        event: "api_key.revoked",
        userId: ctx.user.id,
        keyPrefix: key.keyPrefix,
        timestamp: new Date().toISOString(),
      }),
    );

    revalidatePath("/dashboard/settings/integrations");
    return { id: key.id };
  });
