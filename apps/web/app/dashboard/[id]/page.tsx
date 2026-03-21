import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { db } from "@aliko-cv/db/client";
import { getResumeById } from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { ResumeHeaderEditor } from "@/components/dashboard/resume/editor/resume-header-editor";
import { TemplateSelector } from "@/components/dashboard/resume/editor/template-selector";
import { SectionList } from "@/components/dashboard/resume/editor/section-list";
import { CopyLinkButton } from "@/components/resume/copy-link-button";
import { PrintButton } from "@/components/resume/print-button";
import { ExportJsonButton } from "@/components/resume/export-json-button";
import { AtsAnalyzer } from "@/components/resume/ats-analyzer";
import { ResumePreview } from "@/components/resume/resume-preview";
import { SplitViewShell } from "@/components/dashboard/resume/editor/split-view-shell";
import type { TemplateType } from "@/lib/schemas/resume";

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

  const template = (resume.template ?? "classic") as TemplateType;

  const toolbar = (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      <Link href="/dashboard">
        <Button variant="ghost" size="icon-sm">
          <ArrowLeftIcon />
        </Button>
      </Link>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{resume.title}</h1>
          <Badge
            variant={resume.status === "published" ? "default" : "secondary"}
          >
            {resume.status === "published" ? "Publié" : "Brouillon"}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {resume.status === "published" && (
          <CopyLinkButton path={`/cv/${resume.slug}`} />
        )}
        <AtsAnalyzer resumeId={resume.id} />
        <ExportJsonButton resumeId={resume.id} />
        <PrintButton />
      </div>
    </div>
  );

  const editorPane = (
    <div className="space-y-6 p-4">
      <ResumeHeaderEditor
        id={resume.id}
        title={resume.title}
        slug={resume.slug}
        summary={resume.summary}
        phone={resume.phone}
        website={resume.website}
        linkedin={resume.linkedin}
        github={resume.github}
        status={resume.status}
      />

      <TemplateSelector resumeId={resume.id} currentTemplate={template} />

      <SectionList resumeId={resume.id} sections={resume.sections} />
    </div>
  );

  const previewPane = (
    <div className="rounded-xl border shadow-sm print:border-none print:shadow-none">
      <ResumePreview
        template={template}
        resume={{
          title: resume.title,
          summary: resume.summary,
          sections: resume.sections,
          user: {
            name: session.user.name,
            email: session.user.email,
          },
          contact: {
            phone: resume.phone,
            website: resume.website,
            linkedin: resume.linkedin,
            github: resume.github,
          },
        }}
      />
    </div>
  );

  return (
    <SplitViewShell toolbar={toolbar} editor={editorPane} preview={previewPane} />
  );
}
