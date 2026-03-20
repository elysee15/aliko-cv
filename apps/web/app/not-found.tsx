import Link from "next/link";
import { FileQuestionIcon, ArrowLeftIcon, HomeIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <FileQuestionIcon className="mx-auto mb-4 size-16 text-muted-foreground/40" />
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Page introuvable
        </h1>
        <p className="mt-2 text-muted-foreground">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button variant="outline">
              <HomeIcon />
              Accueil
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button>
              <ArrowLeftIcon />
              Tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
