"use server";

import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  createTelegramLinkToken,
  getTelegramLinkByUser,
  unlinkTelegram,
} from "@aliko-cv/db/queries";

import { authClient } from "@/lib/safe-action";

export const generateTelegramTokenAction = authClient.action(
  async ({ ctx }) => {
    const token = await createTelegramLinkToken(db, ctx.user.id);
    return { token };
  },
);

export const getTelegramStatusAction = authClient.action(async ({ ctx }) => {
  const link = await getTelegramLinkByUser(db, ctx.user.id);
  return { linked: !!link, username: link?.username ?? null };
});

export const unlinkTelegramAction = authClient.action(async ({ ctx }) => {
  await unlinkTelegram(db, ctx.user.id);
  revalidatePath("/dashboard/settings/integrations");
  return null;
});
