import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FileTextIcon } from "lucide-react";

import { db } from "@aliko-cv/db/client";
import { getResumesByUser } from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
import { CreateResumeDialog } from "@/components/dashboard/resume/create-resume-dialog";
import { ResumeCard } from "@/components/dashboard/resume/resume-card";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

  const user = session.user;

  const resumes = await getResumesByUser(db, user.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Mes CV</h1>
          <p className="text-sm text-muted-foreground">
            {resumes.length === 0
              ? "Créez votre premier CV pour commencer."
              : `${resumes.length} CV`}
          </p>
        </div>
        <CreateResumeDialog />
      </div>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <FileTextIcon className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">Aucun CV pour le moment</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cliquez sur &quot;Nouveau CV&quot; pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <ResumeCard
              key={r.id}
              id={r.id}
              title={r.title}
              status={r.status}
              updatedAt={r.updatedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
