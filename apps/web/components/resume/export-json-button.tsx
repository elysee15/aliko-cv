"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

type Props = {
  resumeId: string;
};

export function ExportJsonButton({ resumeId }: Props) {
  async function handleExport() {
    const res = await fetch(`/api/resume/${resumeId}/json`);
    if (!res.ok) return;

    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title ?? "cv"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <DownloadIcon />
      JSON
    </Button>
  );
}
