"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { authClient } from "@/lib/auth-client";

type SignOutButtonProps = {
  className?: string;
};

/**
 * Better Auth sign-out is POST-only (no GET); use this instead of a plain link.
 */
export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      const { error } = await authClient.signOut();
      if (!error) {
        router.push("/sign-in");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      disabled={pending}
      onClick={() => void handleSignOut()}
    >
      {pending ? "Déconnexion…" : "Déconnexion"}
    </Button>
  );
}
