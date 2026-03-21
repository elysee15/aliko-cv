import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@aliko-cv/db/client";
import { getResumeById } from "@aliko-cv/db/queries";
import { auth } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";

type Params = { id: string };

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const resume = await getResumeById(db, id, session.user.id);

  if (!resume) {
    return NextResponse.json({ error: "CV introuvable" }, { status: 404 });
  }

  const payload = {
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
    user: {
      name: session.user.name,
      email: session.user.email,
    },
    sections: resume.sections.map((s) => ({
      type: s.type,
      title: s.title,
      visible: s.visible,
      entries: s.entries.map((e) => ({
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
    exportedAt: new Date().toISOString(),
  };

  dispatchWebhook(session.user.id, "resume.exported", {
    resumeId: id,
    format: "json",
  });

  return NextResponse.json(payload);
}
