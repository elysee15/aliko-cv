"use client";

import { useEffect } from "react";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export default function DashboardError({
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
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertCircleIcon className="mb-4 size-10 text-destructive/60" />
      <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Impossible de charger cette page. Réessayez ou revenez plus tard.
      </p>
      <Button variant="outline" className="mt-6" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
