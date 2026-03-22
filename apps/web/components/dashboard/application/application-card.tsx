"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import {
  BuildingIcon,
  BriefcaseIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  TrashIcon,
  CalendarIcon,
  FileTextIcon,
  MailIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import type { ApplicationStatus } from "@aliko-cv/db/queries";
import { getStatusConfig, APPLICATION_STATUSES } from "@/lib/application-status";
import {
  updateApplicationAction,
  deleteApplicationAction,
} from "@/app/actions/applications";
import { extractActionError } from "@/lib/action-error";

type Props = {
  id: string;
  company: string;
  jobTitle: string;
  jobUrl?: string | null;
  status: ApplicationStatus;
  appliedAt?: string | null;
  resumeTitle?: string | null;
  coverLetterTitle?: string | null;
  updatedAt: Date;
  onEdit: (id: string) => void;
};

export function ApplicationCard({
  id,
  company,
  jobTitle,
  jobUrl,
  status,
  appliedAt,
  resumeTitle,
  coverLetterTitle,
  updatedAt,
  onEdit,
}: Props) {
  const router = useRouter();
  const statusConfig = getStatusConfig(status);

  const updateAction = useAction(updateApplicationAction, {
    onSuccess: () => router.refresh(),
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const deleteAction = useAction(deleteApplicationAction, {
    onSuccess: () => {
      toast.success("Candidature supprimée.");
      router.refresh();
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const isPending = updateAction.isExecuting || deleteAction.isExecuting;

  function handleStatusChange(newStatus: ApplicationStatus) {
    updateAction.execute({ id, status: newStatus });
  }

  function handleDelete() {
    deleteAction.execute({ id });
  }

  return (
    <div
      className={`group flex cursor-pointer flex-col gap-2 rounded-none border p-4 transition-colors hover:bg-muted/50 ${isPending ? "pointer-events-none opacity-50" : ""}`}
      onClick={() => onEdit(id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <BuildingIcon className="size-4 shrink-0 text-primary" />
            <h3 className="truncate text-sm font-medium">{company}</h3>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 pl-6">
            <BriefcaseIcon className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate text-xs text-muted-foreground">
              {jobTitle}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {jobUrl && (
            <a
              href={jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLinkIcon className="size-3.5" />
            </a>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                />
              }
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {APPLICATION_STATUSES.filter((s) => s.value !== status).map(
                (s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(s.value);
                    }}
                  >
                    <span
                      className={`inline-block size-2 rounded-full ${s.bgClass}`}
                    />
                    {s.label}
                  </DropdownMenuItem>
                ),
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              >
                <TrashIcon />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bgClass}`}
        >
          {statusConfig.label}
        </span>
        {appliedAt && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <CalendarIcon className="size-2.5" />
            {new Date(appliedAt + "T00:00:00").toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-3 text-[10px] text-muted-foreground">
        {resumeTitle && (
          <span className="flex items-center gap-1 truncate">
            <FileTextIcon className="size-2.5 shrink-0" />
            {resumeTitle}
          </span>
        )}
        {coverLetterTitle && (
          <span className="flex items-center gap-1 truncate">
            <MailIcon className="size-2.5 shrink-0" />
            {coverLetterTitle}
          </span>
        )}
        <span className="ml-auto shrink-0">
          {updatedAt.toLocaleDateString("fr-FR")}
        </span>
      </div>
    </div>
  );
}
