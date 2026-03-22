import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@aliko-cv/db/client";
import { getResumeById, updateResume } from "@aliko-cv/db/queries";
import { resumeStatusEnum, resumeTemplateEnum } from "@aliko-cv/db/schema";
import { authenticateApiKey, authenticateApiKeyWrite } from "@/lib/api-auth";
import { dispatchWebhook } from "@/lib/webhooks";

type Params = { id: string };

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const result = await authenticateApiKey(request);
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const resume = await getResumeById(db, id, result.userId);

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const payload = {
    id: resume.id,
    title: resume.title,
    slug: resume.slug,
    summary: resume.summary,
    template: resume.template,
    status: resume.status,
    contact: {
      phone: resume.phone,
      website: resume.website,
      linkedin: resume.linkedin,
      github: resume.github,
    },
    sections: resume.sections.map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      visible: s.visible,
      entries: s.entries.map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: e.subtitle,
        organization: e.organization,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        current: e.current,
        description: e.description,
        visible: e.visible,
      })),
    })),
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
  };

  return NextResponse.json({ data: payload });
}

const patchResumeSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(2000).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  website: z.url().max(500).nullable().optional(),
  linkedin: z.string().max(500).nullable().optional(),
  github: z.string().max(500).nullable().optional(),
  status: z.enum(resumeStatusEnum.enumValues).optional(),
  template: z.enum(resumeTemplateEnum.enumValues).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const auth = await authenticateApiKeyWrite(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchResumeSchema.safeParse(body);
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
    const updated = await updateResume(db, {
      id,
      userId: auth.userId,
      ...parsed.data,
    });

    if (!updated) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    dispatchWebhook(auth.userId, "resume.updated", { resumeId: id });

    return NextResponse.json({
      data: {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        summary: updated.summary,
        status: updated.status,
        template: updated.template,
        contact: {
          phone: updated.phone,
          website: updated.website,
          linkedin: updated.linkedin,
          github: updated.github,
        },
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error("PATCH /api/v1/resumes/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
