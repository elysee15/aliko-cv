import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@aliko-cv/db/client";
import { getResumeById } from "@aliko-cv/db/queries";
import { auth } from "@/lib/auth";
import { analyzeAts } from "@/lib/ats/analyzer";

type Params = { id: string };

export async function POST(
  request: Request,
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

  let body: { jobDescription?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 },
    );
  }

  const jobDescription = body.jobDescription?.trim();
  if (!jobDescription || jobDescription.length < 20) {
    return NextResponse.json(
      { error: "L'offre d'emploi doit contenir au moins 20 caractères." },
      { status: 400 },
    );
  }

  const result = analyzeAts(jobDescription, {
    title: resume.title,
    summary: resume.summary,
    sections: resume.sections.map((s) => ({
      title: s.title,
      entries: s.entries.map((e) => ({
        title: e.title,
        subtitle: e.subtitle,
        organization: e.organization,
        description: e.description,
      })),
    })),
  });

  return NextResponse.json(result);
}
