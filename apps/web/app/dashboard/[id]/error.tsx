"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircleIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircleIcon className="mb-4 size-10 text-destructive/60" />
        <h2 className="text-lg font-semibold">Impossible de charger ce CV</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Le CV demandé est introuvable ou une erreur est survenue.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeftIcon data-icon="inline-start" />
              Retour
            </Button>
          </Link>
          <Button onClick={reset}>Réessayer</Button>
        </div>
      </div>
    </div>
  );
}
