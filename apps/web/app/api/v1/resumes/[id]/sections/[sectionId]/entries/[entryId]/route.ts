import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@aliko-cv/db/client";
import { updateEntry, getEntryWithAncestors } from "@aliko-cv/db/queries";
import { authenticateApiKeyWrite } from "@/lib/api-auth";
import { dispatchWebhook } from "@/lib/webhooks";

type Params = { id: string; sectionId: string; entryId: string };

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const patchEntrySchema = z.object({
  title: z.string().min(1).max(300).optional(),
  subtitle: z.string().max(300).nullable().optional(),
  organization: z.string().max(300).nullable().optional(),
  location: z.string().max(300).nullable().optional(),
  startDate: z.string().regex(dateRegex, "Expected YYYY-MM-DD").nullable().optional(),
  endDate: z.string().regex(dateRegex, "Expected YYYY-MM-DD").nullable().optional(),
  current: z.boolean().optional(),
  description: z.string().max(5000).nullable().optional(),
  visible: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const auth = await authenticateApiKeyWrite(request);
  if (auth instanceof NextResponse) return auth;

  const { id: resumeId, sectionId, entryId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 },
    );
  }

  try {
    const ancestors = await getEntryWithAncestors(db, entryId, auth.userId);
    if (!ancestors) {
      return NextResponse.json(
        { error: "Entry not found or access denied" },
        { status: 404 },
      );
    }
    if (ancestors.sectionId !== sectionId || ancestors.resumeId !== resumeId) {
      return NextResponse.json(
        { error: "Entry does not belong to the specified section/resume" },
        { status: 400 },
      );
    }

    const updated = await updateEntry(db, auth.userId, {
      id: entryId,
      ...parsed.data,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Entry not found or access denied" },
        { status: 404 },
      );
    }

    dispatchWebhook(auth.userId, "resume.updated", { resumeId });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("PATCH /api/v1/.../entries/[entryId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
