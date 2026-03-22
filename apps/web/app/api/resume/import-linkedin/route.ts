import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@aliko-cv/db/client";
import { createResume } from "@aliko-cv/db/queries";
import { resumeSection, resumeEntry } from "@aliko-cv/db/schema";

import { auth } from "@/lib/auth";
import { parseLinkedInZip } from "@/lib/linkedin/parser";
import { linkedInToSections } from "@/lib/linkedin/converter";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 50 Mo)" },
      { status: 413 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Aucun fichier fourni" },
      { status: 400 },
    );
  }

  if (!file.name.endsWith(".zip")) {
    return NextResponse.json(
      { error: "Le fichier doit être un ZIP (export LinkedIn)" },
      { status: 400 },
    );
  }

  try {
    const buffer = await file.arrayBuffer();
    const linkedInData = await parseLinkedInZip(buffer);
    const { summary, sections } = linkedInToSections(linkedInData);

    const profileName = [
      linkedInData.profile?.firstName,
      linkedInData.profile?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    const title = profileName
      ? `CV de ${profileName}`
      : "CV importé LinkedIn";

    const slug = `linkedin-${Date.now().toString(36)}`;

    const resume = await createResume(db, {
      userId: session.user.id,
      title,
      slug,
      summary: summary ?? undefined,
    });

    await db.transaction(async (tx) => {
      for (const { section, entries } of sections) {
        const [created] = await tx
          .insert(resumeSection)
          .values({ ...section, resumeId: resume!.id })
          .returning({ id: resumeSection.id });

        if (entries.length > 0) {
          await tx.insert(resumeEntry).values(
            entries.map((entry) => ({
              ...entry,
              sectionId: created!.id,
            })),
          );
        }
      }
    });

    const stats = {
      positions: linkedInData.positions.length,
      education: linkedInData.education.length,
      skills: linkedInData.skills.length,
      certifications: linkedInData.certifications.length,
      languages: linkedInData.languages.length,
    };

    return NextResponse.json({
      success: true,
      resumeId: resume!.id,
      title,
      stats,
    });
  } catch (err) {
    console.error("LinkedIn import error:", err);
    return NextResponse.json(
      { error: "Impossible de parser le fichier LinkedIn. Vérifiez qu'il s'agit bien du ZIP d'export officiel." },
      { status: 422 },
    );
  }
}
