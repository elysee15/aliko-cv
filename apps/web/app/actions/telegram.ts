"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  createTelegramLinkToken,
  getTelegramLinkByUser,
  unlinkTelegram,
} from "@aliko-cv/db/queries";
import { auth } from "@/lib/auth";
import type { ActionResult } from "./resume";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");
  return session.user;
}

export async function generateTelegramTokenAction(): Promise<
  ActionResult<{ token: string }>
> {
  try {
    const user = await requireUser();
    const token = await createTelegramLinkToken(db, user.id);
    return { success: true, data: { token } };
  } catch {
    return { success: false, error: "Impossible de générer le token." };
  }
}

export async function getTelegramStatusAction(): Promise<
  ActionResult<{ linked: boolean; username?: string | null }>
> {
  try {
    const user = await requireUser();
    const link = await getTelegramLinkByUser(db, user.id);
    return {
      success: true,
      data: { linked: !!link, username: link?.username },
    };
  } catch {
    return { success: false, error: "Erreur" };
  }
}

export async function unlinkTelegramAction(): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await unlinkTelegram(db, user.id);
    revalidatePath("/dashboard/settings");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Impossible de délier le compte Telegram." };
  }
}
