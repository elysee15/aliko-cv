"use client";

import { useState } from "react";
import { SearchIcon, FileTextIcon } from "lucide-react";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

import { ResumeCard } from "./resume-card";

type Resume = {
  id: string;
  title: string;
  status: "draft" | "published";
  updatedAt: Date;
};

type StatusFilter = "all" | "draft" | "published";

const filters: { value: StatusFilter; label: (c: number) => string }[] = [
  { value: "all", label: (c) => `Tous (${c})` },
  { value: "draft", label: (c) => `Brouillons (${c})` },
  { value: "published", label: (c) => `Publiés (${c})` },
];

export function ResumeList({ resumes }: { resumes: Resume[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const counts: Record<StatusFilter, number> = {
    all: resumes.length,
    draft: resumes.filter((r) => r.status === "draft").length,
    published: resumes.filter((r) => r.status === "published").length,
  };

  const filtered = resumes.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un CV…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex shrink-0 gap-1 rounded-none border p-0.5">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 rounded-md px-2.5 text-xs font-medium",
                statusFilter === f.value &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
              )}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label(counts[f.value])}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-none border border-dashed py-16 text-center">
          <FileTextIcon className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">Aucun résultat</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? `Aucun CV ne correspond à « ${search} ».`
              : "Aucun CV avec ce filtre."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
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
