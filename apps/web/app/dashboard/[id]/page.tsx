import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon, EyeIcon } from "lucide-react";
import Link from "next/link";

import { db } from "@aliko-cv/db/client";
import { getResumeById } from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { ResumeHeaderEditor } from "@/components/dashboard/resume/editor/resume-header-editor";
import { SectionList } from "@/components/dashboard/resume/editor/section-list";
import { CopyLinkButton } from "@/components/resume/copy-link-button";

type Params = Promise<{ id: string }>;

export default async function ResumeEditorPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

  const resume = await getResumeById(db, id, session.user.id);

  if (!resume) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeftIcon />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{resume.title}</h1>
            <Badge
              variant={
                resume.status === "published" ? "default" : "secondary"
              }
            >
              {resume.status === "published" ? "Publié" : "Brouillon"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {resume.status === "published" && (
            <CopyLinkButton path={`/cv/${resume.slug}`} />
          )}
          <Link href={`/dashboard/${id}/preview`}>
            <Button variant="outline" size="sm">
              <EyeIcon data-icon="inline-start" />
              Prévisualiser
            </Button>
          </Link>
        </div>
      </div>

      <ResumeHeaderEditor
        id={resume.id}
        title={resume.title}
        summary={resume.summary}
        status={resume.status}
      />

      <SectionList resumeId={resume.id} sections={resume.sections} />
    </div>
  );
}
