import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@aliko-cv/db/client";
import { getFullResumesByUser, getApiKeysByUser } from "@aliko-cv/db/queries";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  const [resumes, apiKeys] = await Promise.all([
    getFullResumesByUser(db, userId),
    getApiKeysByUser(db, userId),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    account: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      createdAt: session.user.createdAt,
    },
    resumes: resumes.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      summary: r.summary,
      template: r.template,
      status: r.status,
      contact: {
        phone: r.phone,
        website: r.website,
        linkedin: r.linkedin,
        github: r.github,
      },
      sections: r.sections.map((s) => ({
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
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
    apiKeys: apiKeys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
    })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="aliko-cv-export-${Date.now()}.json"`,
    },
  });
}
