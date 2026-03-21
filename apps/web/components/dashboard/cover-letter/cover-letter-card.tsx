"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MailIcon,
  TrashIcon,
  MoreHorizontalIcon,
  BuildingIcon,
  BriefcaseIcon,
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

import { deleteCoverLetterAction } from "@/app/actions/cover-letters";

type Props = {
  id: string;
  title: string;
  company?: string | null;
  jobTitle?: string | null;
  resumeTitle?: string | null;
  updatedAt: Date;
};

export function CoverLetterCard({
  id,
  title,
  company,
  jobTitle,
  resumeTitle,
  updatedAt,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await deleteCoverLetterAction(id);
    if (res.success) {
      toast.success("Lettre supprimée.");
      router.refresh();
    } else {
      toast.error(res.error);
    }
    setDeleting(false);
  }

  return (
    <div
      className="group flex cursor-pointer flex-col gap-2 rounded-none border p-4 transition-colors hover:bg-muted/50"
      onClick={() => router.push(`/dashboard/cover-letters/${id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <MailIcon className="size-4 shrink-0 text-primary" />
          <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
        </div>
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
            <DropdownMenuItem
              className="text-destructive"
              disabled={deleting}
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

      <div className="flex flex-wrap items-center gap-1.5">
        {company && (
          <Badge variant="secondary" className="gap-1">
            <BuildingIcon className="size-3" />
            {company}
          </Badge>
        )}
        {jobTitle && (
          <Badge variant="outline" className="gap-1">
            <BriefcaseIcon className="size-3" />
            {jobTitle}
          </Badge>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between">
        {resumeTitle && (
          <span className="text-xs text-muted-foreground">
            CV : {resumeTitle}
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {updatedAt.toLocaleDateString("fr-FR")}
        </span>
      </div>
    </div>
  );
}
