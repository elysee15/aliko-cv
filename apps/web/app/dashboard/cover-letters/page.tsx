import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MailIcon } from "lucide-react";

import { db } from "@aliko-cv/db/client";
import { getCoverLettersByUser, getResumesByUser } from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
import { CreateCoverLetterDialog } from "@/components/dashboard/cover-letter/create-cover-letter-dialog";
import { CoverLetterCard } from "@/components/dashboard/cover-letter/cover-letter-card";

export const metadata: Metadata = {
  title: "Lettres de motivation",
};

export default async function CoverLettersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

  const [letters, resumes] = await Promise.all([
    getCoverLettersByUser(db, session.user.id),
    getResumesByUser(db, session.user.id),
  ]);

  const resumeMap = new Map(resumes.map((r) => [r.id, r.title]));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Lettres de motivation</h1>
          <p className="text-sm text-muted-foreground">
            {letters.length === 0
              ? "Créez votre première lettre de motivation."
              : `${letters.length} lettre${letters.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <CreateCoverLetterDialog
          resumes={resumes.map((r) => ({ id: r.id, title: r.title }))}
        />
      </div>

      {letters.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-none border border-dashed py-16 text-center">
          <MailIcon className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">Aucune lettre pour le moment</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez une lettre de motivation pour accompagner vos candidatures.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {letters.map((l) => (
            <CoverLetterCard
              key={l.id}
              id={l.id}
              title={l.title}
              company={l.company}
              jobTitle={l.jobTitle}
              resumeTitle={l.resumeId ? resumeMap.get(l.resumeId) ?? null : null}
              updatedAt={l.updatedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
