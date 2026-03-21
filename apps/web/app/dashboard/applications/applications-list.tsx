"use client";

import { useState } from "react";
import { BriefcaseIcon } from "lucide-react";

import type { ApplicationStatus } from "@aliko-cv/db/queries";
import { StatusFilters } from "@/components/dashboard/application/status-filters";
import { ApplicationCard } from "@/components/dashboard/application/application-card";
import { ApplicationDialog } from "@/components/dashboard/application/application-dialog";

type ApplicationItem = {
  id: string;
  company: string;
  jobTitle: string;
  jobUrl: string | null;
  status: ApplicationStatus;
  appliedAt: string | null;
  notes: string | null;
  resumeId: string | null;
  coverLetterId: string | null;
  resumeTitle: string | null;
  coverLetterTitle: string | null;
  updatedAt: Date;
};

type Props = {
  applications: ApplicationItem[];
  counts: Record<string, number>;
  resumes: { id: string; title: string }[];
  coverLetters: { id: string; title: string }[];
};

export function ApplicationsList({
  applications,
  counts,
  resumes,
  coverLetters,
}: Props) {
  const [editId, setEditId] = useState<string | null>(null);

  const editData = editId
    ? applications.find((a) => a.id === editId) ?? null
    : null;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Candidatures</h1>
          <p className="text-sm text-muted-foreground">
            {applications.length === 0
              ? "Suivez vos candidatures en un seul endroit."
              : `${applications.length} candidature${applications.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <ApplicationDialog resumes={resumes} coverLetters={coverLetters} />
      </div>

      <StatusFilters counts={counts} />

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-none border border-dashed py-16 text-center">
          <BriefcaseIcon className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">
            Aucune candidature pour le moment
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez une candidature pour commencer le suivi.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((a) => (
            <ApplicationCard
              key={a.id}
              id={a.id}
              company={a.company}
              jobTitle={a.jobTitle}
              jobUrl={a.jobUrl}
              status={a.status}
              appliedAt={a.appliedAt}
              resumeTitle={a.resumeTitle}
              coverLetterTitle={a.coverLetterTitle}
              updatedAt={a.updatedAt}
              onEdit={setEditId}
            />
          ))}
        </div>
      )}

      <ApplicationDialog
        resumes={resumes}
        coverLetters={coverLetters}
        editData={editData}
        open={!!editId}
        onOpenChange={(v) => {
          if (!v) setEditId(null);
        }}
        triggerHidden
      />
    </>
  );
}
