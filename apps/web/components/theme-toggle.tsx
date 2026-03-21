"use client";

import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      title={resolvedTheme === "dark" ? "Mode clair" : "Mode sombre"}
      aria-label={resolvedTheme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      <SunIcon className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
