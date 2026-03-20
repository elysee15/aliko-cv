"use client";

import { useState } from "react";
import { CheckIcon, ShareIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <CheckIcon data-icon="inline-start" />
          Copié !
        </>
      ) : (
        <>
          <ShareIcon data-icon="inline-start" />
          Copier le lien
        </>
      )}
    </Button>
  );
}
