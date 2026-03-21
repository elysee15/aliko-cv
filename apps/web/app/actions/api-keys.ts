"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import { createApiKey, revokeApiKey, getApiKeysByUser } from "@aliko-cv/db/queries";
import { auth } from "@/lib/auth";
import type { ActionResult } from "./resume";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");
  return session.user;
}

export async function createApiKeyAction(
  name: string,
): Promise<ActionResult<{ rawKey: string }>> {
  try {
    const user = await requireUser();

    if (!name.trim()) {
      return { success: false, error: "Le nom est requis." };
    }

    const existing = await getApiKeysByUser(db, user.id);
    if (existing.length >= 5) {
      return { success: false, error: "Maximum 5 clés API actives." };
    }

    const { rawKey } = await createApiKey(db, user.id, name.trim());

    revalidatePath("/dashboard/settings");
    return { success: true, data: { rawKey } };
  } catch {
    return { success: false, error: "Impossible de créer la clé API." };
  }
}

export async function revokeApiKeyAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const key = await revokeApiKey(db, id, user.id);
    if (!key) return { success: false, error: "Clé introuvable." };

    revalidatePath("/dashboard/settings");
    return { success: true, data: key };
  } catch {
    return { success: false, error: "Impossible de révoquer la clé API." };
  }
}
