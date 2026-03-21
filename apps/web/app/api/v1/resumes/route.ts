import { NextResponse } from "next/server";

import { db } from "@aliko-cv/db/client";
import { getResumesByUser } from "@aliko-cv/db/queries";
import { authenticateApiKey } from "@/lib/api-auth";

export async function GET(request: Request) {
  const result = await authenticateApiKey(request);
  if (result instanceof NextResponse) return result;

  const resumes = await getResumesByUser(db, result.userId);

  const payload = resumes.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    status: r.status,
    template: r.template,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  return NextResponse.json({ data: payload });
}
