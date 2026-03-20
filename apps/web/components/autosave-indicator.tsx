"use client";

import { CheckIcon, LoaderIcon, AlertCircleIcon } from "lucide-react";

type Props = {
  status: "idle" | "saving" | "saved" | "error";
};

export function AutosaveIndicator({ status }: Props) {
  if (status === "idle") return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      {status === "saving" && (
        <>
          <LoaderIcon className="size-3 animate-spin" />
          Enregistrement…
        </>
      )}
      {status === "saved" && (
        <>
          <CheckIcon className="size-3 text-green-600" />
          Enregistré
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircleIcon className="size-3 text-destructive" />
          Erreur
        </>
      )}
    </span>
  );
}
