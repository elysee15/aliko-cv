"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import { upsertPortfolio } from "@aliko-cv/db/queries";
import { auth } from "@/lib/auth";
import type { ActionResult } from "./resume";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");
  return session.user;
}

export async function updatePortfolioAction(
  input: {
    enabled?: boolean;
    slug?: string;
    headline?: string | null;
    bio?: string | null;
  },
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const portfolio = await upsertPortfolio(db, user.id, input);
    revalidatePath("/dashboard/settings");
    return { success: true, data: portfolio };
  } catch {
    return { success: false, error: "Impossible de mettre à jour le portfolio." };
  }
}
