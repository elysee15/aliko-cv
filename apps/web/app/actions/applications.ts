"use server";

import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  createApplication,
  updateApplication,
  deleteApplication,
} from "@aliko-cv/db/queries";

import { authClient, ActionError } from "@/lib/safe-action";
import { dispatchWebhook } from "@/lib/webhooks";
import {
  createApplicationSchema,
  updateApplicationSchema,
  deleteApplicationSchema,
} from "@/lib/schemas/applications";

export const createApplicationAction = authClient
  .inputSchema(createApplicationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const app = await createApplication(db, {
      userId: ctx.user.id,
      company: parsedInput.company,
      jobTitle: parsedInput.jobTitle,
      jobUrl: parsedInput.jobUrl ?? null,
      status: parsedInput.status ?? "wishlist",
      appliedAt: parsedInput.appliedAt ?? null,
      notes: parsedInput.notes ?? null,
      resumeId: parsedInput.resumeId ?? null,
      coverLetterId: parsedInput.coverLetterId ?? null,
    });

    dispatchWebhook(ctx.user.id, "application.created", {
      applicationId: app.id,
      company: app.company,
      jobTitle: app.jobTitle,
      status: app.status,
    });

    revalidatePath("/dashboard/applications");
    return { id: app.id };
  });

export const updateApplicationAction = authClient
  .inputSchema(updateApplicationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...rest } = parsedInput;

    const app = await updateApplication(db, {
      id,
      userId: ctx.user.id,
      ...rest,
    });

    if (!app) throw new ActionError("Candidature introuvable.");

    revalidatePath("/dashboard/applications");
    return { id: app.id };
  });

export const deleteApplicationAction = authClient
  .inputSchema(deleteApplicationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const app = await deleteApplication(db, parsedInput.id, ctx.user.id);
    if (!app) throw new ActionError("Candidature introuvable.");

    revalidatePath("/dashboard/applications");
    return { id: app.id };
  });
