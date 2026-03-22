import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@aliko-cv/db/client";
import { createEntry } from "@aliko-cv/db/queries";
import { authenticateApiKeyWrite } from "@/lib/api-auth";
import { dispatchWebhook } from "@/lib/webhooks";

type Params = { id: string; sectionId: string };

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const createEntrySchema = z.object({
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  organization: z.string().max(300).optional(),
  location: z.string().max(300).optional(),
  startDate: z.string().regex(dateRegex, "Expected YYYY-MM-DD").optional(),
  endDate: z.string().regex(dateRegex, "Expected YYYY-MM-DD").optional(),
  current: z.boolean().optional(),
  description: z.string().max(5000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const auth = await authenticateApiKeyWrite(request);
  if (auth instanceof NextResponse) return auth;

  const { id: resumeId, sectionId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const entry = await createEntry(db, auth.userId, {
    sectionId,
    ...parsed.data,
    source: "api",
  });

  if (!entry) {
    return NextResponse.json(
      { error: "Section not found or access denied" },
      { status: 404 },
    );
  }

  dispatchWebhook(auth.userId, "resume.updated", { resumeId });

  return NextResponse.json({ data: entry }, { status: 201 });
}
