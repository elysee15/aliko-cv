"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  createApplication,
  updateApplication,
  deleteApplication,
  type ApplicationStatus,
} from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");
  return session.user;
}

export async function createApplicationAction(input: {
  company: string;
  jobTitle: string;
  jobUrl?: string | null;
  status?: ApplicationStatus;
  appliedAt?: string | null;
  notes?: string | null;
  resumeId?: string | null;
  coverLetterId?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    if (!input.company?.trim())
      return { success: false, error: "L'entreprise est requise." };
    if (!input.jobTitle?.trim())
      return { success: false, error: "Le poste est requis." };

    const app = await createApplication(db, {
      userId: user.id,
      company: input.company.trim(),
      jobTitle: input.jobTitle.trim(),
      jobUrl: input.jobUrl ?? null,
      status: input.status ?? "wishlist",
      appliedAt: input.appliedAt ?? null,
      notes: input.notes ?? null,
      resumeId: input.resumeId ?? null,
      coverLetterId: input.coverLetterId ?? null,
    });

    dispatchWebhook(user.id, "resume.created", {
      type: "application",
      applicationId: app.id,
      company: app.company,
      jobTitle: app.jobTitle,
      status: app.status,
    });

    revalidatePath("/dashboard/applications");
    return { success: true, data: { id: app.id } };
  } catch {
    return { success: false, error: "Impossible de créer la candidature." };
  }
}

export async function updateApplicationAction(input: {
  id: string;
  company?: string;
  jobTitle?: string;
  jobUrl?: string | null;
  status?: ApplicationStatus;
  appliedAt?: string | null;
  notes?: string | null;
  resumeId?: string | null;
  coverLetterId?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const { id, ...rest } = input;

    const app = await updateApplication(db, {
      id,
      userId: user.id,
      ...rest,
    });

    if (!app) return { success: false, error: "Candidature introuvable." };

    revalidatePath("/dashboard/applications");
    return { success: true, data: { id: app.id } };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." };
  }
}

export async function deleteApplicationAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const app = await deleteApplication(db, id, user.id);
    if (!app) return { success: false, error: "Candidature introuvable." };

    revalidatePath("/dashboard/applications");
    return { success: true, data: { id: app.id } };
  } catch {
    return { success: false, error: "Erreur lors de la suppression." };
  }
}
