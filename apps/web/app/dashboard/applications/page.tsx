import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BriefcaseIcon } from "lucide-react";

import { db } from "@aliko-cv/db/client";
import {
  getApplicationsByUser,
  getApplicationCountsByStatus,
  getResumesByUser,
  getCoverLettersByUser,
  type ApplicationStatus,
} from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
import { ApplicationsList } from "./applications-list";

export const metadata: Metadata = {
  title: "Candidatures",
};

type Props = {
  searchParams: Promise<{ status?: string }>;
};

const VALID_STATUSES = new Set<ApplicationStatus>([
  "wishlist",
  "applied",
  "interview",
  "offer",
  "rejected",
  "archived",
]);

export default async function ApplicationsPage({ searchParams }: Props) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

  const { status: rawStatus } = await searchParams;
  const statusFilter =
    rawStatus && VALID_STATUSES.has(rawStatus as ApplicationStatus)
      ? (rawStatus as ApplicationStatus)
      : undefined;

  const [applications, counts, resumes, coverLetters] = await Promise.all([
    getApplicationsByUser(db, session.user.id, statusFilter),
    getApplicationCountsByStatus(db, session.user.id),
    getResumesByUser(db, session.user.id),
    getCoverLettersByUser(db, session.user.id),
  ]);

  const resumeMap = new Map(resumes.map((r) => [r.id, r.title]));
  const coverLetterMap = new Map(coverLetters.map((cl) => [cl.id, cl.title]));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ApplicationsList
        applications={applications.map((a) => ({
          ...a,
          resumeTitle: a.resumeId ? resumeMap.get(a.resumeId) ?? null : null,
          coverLetterTitle: a.coverLetterId
            ? coverLetterMap.get(a.coverLetterId) ?? null
            : null,
        }))}
        counts={counts}
        resumes={resumes.map((r) => ({ id: r.id, title: r.title }))}
        coverLetters={coverLetters.map((cl) => ({
          id: cl.id,
          title: cl.title,
        }))}
      />
    </div>
  );
}
