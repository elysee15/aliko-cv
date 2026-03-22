"use client";

import { useState } from "react";
import {
  SendIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
} from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";

type TelegramUpdate = {
  entryId: string;
  entryTitle: string;
  entryOrganization: string | null;
  entryCreatedAt: Date;
  sectionId: string;
  sectionType: string;
  sectionTitle: string;
  resumeId: string;
  resumeTitle: string;
};

type Props = {
  updates: TelegramUpdate[];
};

const sectionTypeLabels: Record<string, string> = {
  experience: "Expérience",
  education: "Formation",
  skills: "Compétences",
  languages: "Langues",
  projects: "Projets",
  certifications: "Certifications",
  volunteering: "Bénévolat",
  interests: "Intérêts",
  custom: "Autre",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export function TelegramUpdatesBanner({ updates }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (updates.length === 0) return null;

  return (
    <div
      role="status"
      aria-label="Mises à jour récentes via Telegram"
      className="rounded-none border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30"
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium"
        onClick={() => setCollapsed(!collapsed)}
      >
        <SendIcon className="size-4 text-blue-600 dark:text-blue-400" />
        <span className="flex-1">
          Mises à jour via Telegram
          <Badge variant="secondary" className="ml-2">
            {updates.length}
          </Badge>
        </span>
        {collapsed ? (
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        ) : (
          <ChevronUpIcon className="size-4 text-muted-foreground" />
        )}
      </button>

      {!collapsed && (
        <div className="border-t border-blue-200 px-4 py-2 dark:border-blue-900">
          <ul className="divide-y divide-blue-100 dark:divide-blue-900/50">
            {updates.map((u) => (
              <li
                key={u.entryId}
                className="flex items-center gap-3 py-2 text-sm"
              >
                <div className="flex-1">
                  <span className="font-medium">{u.entryTitle}</span>
                  {u.entryOrganization && (
                    <span className="text-muted-foreground">
                      {" "}— {u.entryOrganization}
                    </span>
                  )}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {sectionTypeLabels[u.sectionType] ?? u.sectionType}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(u.entryCreatedAt)}
                </span>
                <a
                  href={`#section-${u.sectionId}`}
                  aria-label={`Voir ${u.entryTitle}`}
                  className="inline-flex items-center justify-center rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLinkIcon className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
