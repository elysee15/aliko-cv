import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { db } from "@aliko-cv/db/client";
import { getCoverLetterById, getResumesByUser } from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
import { CoverLetterEditor } from "@/components/dashboard/cover-letter/cover-letter-editor";

type Params = Promise<{ id: string }>;

export default async function CoverLetterEditorPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

  const [letter, resumes] = await Promise.all([
    getCoverLetterById(db, id, session.user.id),
    getResumesByUser(db, session.user.id),
  ]);

  if (!letter) notFound();

  return (
    <CoverLetterEditor
      letter={{
        id: letter.id,
        title: letter.title,
        company: letter.company,
        jobTitle: letter.jobTitle,
        resumeId: letter.resumeId,
        content: letter.content,
      }}
      resumes={resumes.map((r) => ({ id: r.id, title: r.title }))}
      userName={session.user.name ?? session.user.email}
    />
  );
}
