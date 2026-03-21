"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { APPLICATION_STATUSES } from "@/lib/application-status";

type Props = {
  counts: Record<string, number>;
};

export function StatusFilters({ counts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status");

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  function handleFilter(status: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.push(`/dashboard/applications?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => handleFilter(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
          !activeStatus
            ? "bg-foreground text-background"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        Tout ({total})
      </button>
      {APPLICATION_STATUSES.map((s) => {
        const count = counts[s.value] ?? 0;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => handleFilter(s.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              activeStatus === s.value
                ? `${s.bgClass} ring-2 ring-offset-1 ring-current/30`
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
