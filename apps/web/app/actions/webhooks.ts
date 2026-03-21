"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  createWebhook,
  deleteWebhook,
  toggleWebhook,
  getWebhooksByUser,
} from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");
  return session.user;
}

const VALID_EVENTS = [
  "resume.created",
  "resume.updated",
  "resume.deleted",
  "resume.published",
  "resume.exported",
] as const;

export async function createWebhookAction(input: {
  url: string;
  events: string[];
}): Promise<ActionResult<{ id: string; secret: string }>> {
  try {
    const user = await requireUser();

    const url = input.url?.trim();
    if (!url) return { success: false, error: "L'URL est requise." };

    try {
      new URL(url);
    } catch {
      return { success: false, error: "URL invalide." };
    }

    if (!url.startsWith("https://")) {
      return { success: false, error: "L'URL doit utiliser HTTPS." };
    }

    const events = input.events.filter((e) =>
      (VALID_EVENTS as readonly string[]).includes(e),
    );
    if (events.length === 0) {
      return {
        success: false,
        error: "Sélectionnez au moins un événement.",
      };
    }

    const existing = await getWebhooksByUser(db, user.id);
    if (existing.length >= 5) {
      return {
        success: false,
        error: "Maximum 5 webhooks. Supprimez-en un d'abord.",
      };
    }

    const secret = `whsec_${Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`;

    const hook = await createWebhook(db, {
      userId: user.id,
      url,
      secret,
      events,
    });

    revalidatePath("/dashboard/settings");
    return { success: true, data: { id: hook.id, secret } };
  } catch {
    return { success: false, error: "Erreur lors de la création." };
  }
}

export async function deleteWebhookAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const hook = await deleteWebhook(db, id, user.id);
    if (!hook) return { success: false, error: "Webhook introuvable." };

    revalidatePath("/dashboard/settings");
    return { success: true, data: { id: hook.id } };
  } catch {
    return { success: false, error: "Erreur lors de la suppression." };
  }
}

export async function toggleWebhookAction(
  id: string,
  active: boolean,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const hook = await toggleWebhook(db, id, user.id, active);
    if (!hook) return { success: false, error: "Webhook introuvable." };

    revalidatePath("/dashboard/settings");
    return { success: true, data: { id: hook.id } };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." };
  }
}
