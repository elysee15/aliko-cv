"use server";

import { headers } from "next/headers";

import { db } from "@aliko-cv/db/client";
import { deleteUserAccount } from "@aliko-cv/db/queries";
import { auth } from "@/lib/auth";
import type { ActionResult } from "./resume";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");
  return session.user;
}

export async function deleteAccountAction(
  confirmEmail: string,
): Promise<ActionResult> {
  try {
    const currentUser = await requireUser();

    if (confirmEmail !== currentUser.email) {
      return { success: false, error: "L'email de confirmation ne correspond pas." };
    }

    await deleteUserAccount(db, currentUser.id);

    return { success: true, data: null };
  } catch (e) {
    console.error("[account] deleteAccountAction failed:", e);
    return { success: false, error: "Impossible de supprimer le compte." };
  }
}
