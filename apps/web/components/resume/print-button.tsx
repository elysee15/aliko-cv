"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export function PrintButton() {
  return (
    <Button size="sm" onClick={() => window.print()}>
      <DownloadIcon data-icon="inline-start" />
      Exporter PDF
    </Button>
  );
}
