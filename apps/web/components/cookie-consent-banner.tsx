"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CookieIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

const COOKIE_NAME = "cookie_consent";
const COOKIE_DAYS = 365;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookie(COOKIE_NAME)) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    setCookie(COOKIE_NAME, "accepted", COOKIE_DAYS);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      className="fixed inset-x-0 bottom-0 z-50 p-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-lg border bg-background p-4 shadow-lg sm:flex-row sm:items-center sm:gap-4">
        <CookieIcon className="hidden size-5 shrink-0 text-muted-foreground sm:block" />
        <p className="flex-1 text-sm text-muted-foreground">
          Ce site utilise uniquement des cookies techniques nécessaires au
          fonctionnement (session, préférences).{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Politique de confidentialité
          </Link>
        </p>
        <Button size="sm" onClick={handleAccept} className="shrink-0">
          Accepter
        </Button>
      </div>
    </div>
  );
}
