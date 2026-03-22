import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { db } from "@aliko-cv/db/client";
import { createResumeFromImport } from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";
import { parseLinkedInZip } from "@/lib/linkedin/parser";
import { linkedInToSections } from "@/lib/linkedin/converter";
import { linkedInDataSchema } from "@/lib/linkedin/schema";

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
    const rawData = await parseLinkedInZip(buffer);
    const linkedInData = linkedInDataSchema.parse(rawData);
    const { summary, sections } = linkedInToSections(linkedInData);

    const profileName = [
      linkedInData.profile?.firstName,
      linkedInData.profile?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    const title = profileName ? `CV de ${profileName}` : "CV importé LinkedIn";
    const slug = `linkedin-${Date.now().toString(36)}`;

    const result = await createResumeFromImport(db, {
      userId: session.user.id,
      title,
      slug,
      summary: summary ?? undefined,
      linkedin: linkedInData.profile?.linkedinUrl ?? undefined,
      sections,
    });

    dispatchWebhook(session.user.id, "resume.created", {
      resumeId: result.id,
      title: result.title,
      source: "linkedin-import",
    });

    revalidatePath("/dashboard");

    const stats = {
      positions: linkedInData.positions.length,
      education: linkedInData.education.length,
      skills: linkedInData.skills.length,
      certifications: linkedInData.certifications.length,
      languages: linkedInData.languages.length,
    };

    return NextResponse.json({
      success: true,
      resumeId: result.id,
      title,
      stats,
    });
  } catch (err) {
    const isDbError =
      err instanceof Error &&
      "severity" in err &&
      "code" in err;

    const step = isDbError
      ? "database"
      : err instanceof ZodError
        ? "validation"
        : err instanceof Error && err.message.includes("not a valid zip")
          ? "zip-parsing"
          : "unknown";

    console.error(`LinkedIn import error [step=${step}]:`, err);

    if (isDbError) {
      return NextResponse.json(
        { error: "Erreur serveur lors de la création du CV." },
        { status: 500 },
      );
    }

    const message =
      err instanceof ZodError
        ? "Le fichier ne contient pas les données LinkedIn attendues."
        : err instanceof Error && err.message.includes("not a valid zip")
          ? "Le fichier n'est pas un ZIP valide."
          : "Impossible de parser le fichier LinkedIn.";

    return NextResponse.json(
      {
        error: message,
        hint: "Vérifiez qu'il s'agit bien du ZIP d'export officiel LinkedIn.",
      },
      { status: 422 },
    );
  }
}
