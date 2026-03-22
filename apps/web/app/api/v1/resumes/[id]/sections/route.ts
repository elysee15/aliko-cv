import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@aliko-cv/db/client";
import { createSection } from "@aliko-cv/db/queries";
import { authenticateApiKeyWrite } from "@/lib/api-auth";
import { dispatchWebhook } from "@/lib/webhooks";

type Params = { id: string };

const createSectionSchema = z.object({
  type: z.enum([
    "experience", "education", "skills", "languages",
    "projects", "certifications", "volunteering", "interests", "custom",
  ]),
  title: z.string().min(1).max(200),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const auth = await authenticateApiKeyWrite(request);
  if (auth instanceof NextResponse) return auth;

  const { id: resumeId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const section = await createSection(db, auth.userId, {
      resumeId,
      type: parsed.data.type,
      title: parsed.data.title,
      source: "api",
    });

    if (!section) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    dispatchWebhook(auth.userId, "resume.updated", { resumeId });

    return NextResponse.json({ data: section }, { status: 201 });
  } catch (err) {
    console.error("POST /api/v1/resumes/[id]/sections error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
