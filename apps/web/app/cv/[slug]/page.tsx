import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { db } from "@aliko-cv/db/client";
import { getPublishedResumeBySlug } from "@aliko-cv/db/queries";

import { ResumePreview } from "@/components/resume/resume-preview";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const resume = await getPublishedResumeBySlug(db, slug);

  if (!resume) return { title: "CV introuvable" };

  return {
    title: `${resume.user.name} — ${resume.title}`,
    description: resume.summary ?? `CV de ${resume.user.name}`,
  };
}

export default async function PublicResumePage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const resume = await getPublishedResumeBySlug(db, slug);

  if (!resume) notFound();

  return (
    <div className="min-h-svh bg-muted/30 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-[210mm]">
        <div className="rounded-xl border bg-background shadow-sm print:border-none print:shadow-none">
          <ResumePreview
            resume={{
              title: resume.title,
              summary: resume.summary,
              sections: resume.sections,
              user: {
                name: resume.user.name,
                email: resume.user.email,
              },
            }}
          />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground print:hidden">
          Créé avec Aliko CV
        </p>
      </div>
    </div>
  );
}
