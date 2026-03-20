"use client";

import { useTransition } from "react";
import Link from "next/link";
import { MoreHorizontalIcon, TrashIcon, FileTextIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import { deleteResumeAction } from "@/app/actions/resume";

type ResumeCardProps = {
  id: string;
  title: string;
  status: "draft" | "published";
  updatedAt: Date;
};

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ResumeCard({ id, title, status, updatedAt }: ResumeCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteResumeAction(id);
    });
  }

  return (
    <Link href={`/dashboard/${id}`} className="block">
      <Card
        className={`transition-colors hover:bg-muted/50 ${isPending ? "pointer-events-none opacity-50" : ""}`}
        size="sm"
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileTextIcon className="size-4 text-muted-foreground" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>
            Modifié {formatRelativeDate(updatedAt)}
          </CardDescription>
          <CardAction>
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.preventDefault()}
            >
              <Badge variant={status === "published" ? "default" : "secondary"}>
                {status === "published" ? "Publié" : "Brouillon"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-xs" />}
                >
                  <MoreHorizontalIcon />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                    <TrashIcon />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardAction>
        </CardHeader>
      </Card>
    </Link>
  );
}
