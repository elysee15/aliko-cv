"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserIcon,
  GlobeIcon,
  PlugIcon,
  ShieldIcon,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const NAV_GROUPS = [
  {
    label: "Compte",
    items: [
      {
        href: "/dashboard/settings",
        label: "Profil & sécurité",
        icon: UserIcon,
        exact: true,
      },
    ],
  },
  {
    label: "Présence",
    items: [
      {
        href: "/dashboard/settings/portfolio",
        label: "Portfolio public",
        icon: GlobeIcon,
      },
    ],
  },
  {
    label: "Intégrations",
    items: [
      {
        href: "/dashboard/settings/integrations",
        label: "API, Webhooks & Telegram",
        icon: PlugIcon,
      },
    ],
  },
  {
    label: "Données",
    items: [
      {
        href: "/dashboard/settings/data",
        label: "Données & RGPD",
        icon: ShieldIcon,
      },
    ],
  },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, "exact" in item && item.exact);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-none px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile horizontal nav */}
      <nav className="overflow-x-auto border-b pb-px lg:hidden">
        <div className="flex gap-1 px-1">
          {NAV_GROUPS.flatMap((group) =>
            group.items.map((item) => {
              const active = isActive(item.href, "exact" in item && item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="size-3.5" />
                  {item.label}
                </Link>
              );
            }),
          )}
        </div>
      </nav>
    </>
  );
}
