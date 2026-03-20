import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { db } from "@aliko-cv/db/client";
import { getResumeById } from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
import { Button } from "@workspace/ui/components/button";
import { ResumePreview } from "@/components/resume/resume-preview";
import { PrintButton } from "@/components/resume/print-button";
import { CopyLinkButton } from "@/components/resume/copy-link-button";
import type { TemplateType } from "@/lib/schemas/resume";

type Params = Promise<{ id: string }>;

export default async function ResumePreviewPage({
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

  const publicUrl = `/cv/${resume.slug}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/${id}`}>
            <Button variant="ghost" size="icon-sm">
              <ArrowLeftIcon />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Prévisualisation</h1>
        </div>
        <div className="flex items-center gap-2">
          {resume.status === "published" && (
            <CopyLinkButton path={publicUrl} />
          )}
          <PrintButton />
        </div>
      </div>

      <div className="rounded-xl border shadow-sm print:border-none print:shadow-none">
        <ResumePreview
          template={(resume.template ?? "classic") as TemplateType}
          resume={{
            title: resume.title,
            summary: resume.summary,
            sections: resume.sections,
            user: {
              name: session.user.name,
              email: session.user.email,
            },
          }}
        />
      </div>
    </div>
  );
}
