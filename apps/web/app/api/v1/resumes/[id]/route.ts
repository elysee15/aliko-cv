import { NextResponse } from "next/server";

import { db } from "@aliko-cv/db/client";
import { getResumeById } from "@aliko-cv/db/queries";
import { authenticateApiKey } from "@/lib/api-auth";

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
