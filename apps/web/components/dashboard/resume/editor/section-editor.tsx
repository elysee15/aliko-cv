"use client";

import { useState, useTransition } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

import {
  deleteSectionAction,
  updateSectionAction,
} from "@/app/actions/resume";
import { sectionTypeLabels, type SectionType } from "@/lib/schemas/resume";
import { EntryEditor } from "./entry-editor";
import { AddEntryDialog } from "./add-entry-dialog";

type Entry = {
  id: string;
  title: string;
  subtitle: string | null;
  organization: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string | null;
  sortOrder: number;
  visible: boolean;
};

type Props = {
  resumeId: string;
  section: {
    id: string;
    type: SectionType;
    title: string;
    sortOrder: number;
    visible: boolean;
    entries: Entry[];
  };
};

export function SectionEditor({ resumeId, section }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleToggleVisibility() {
    startTransition(async () => {
      await updateSectionAction(section.id, resumeId, {
        visible: !section.visible,
      });
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSectionAction(section.id, resumeId);
    });
  }

  return (
    <Card
      className={isPending ? "pointer-events-none opacity-50" : undefined}
    >
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronUpIcon className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          )}
          <CardTitle>{section.title}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {sectionTypeLabels[section.type]}
          </Badge>
          {!section.visible && (
            <Badge variant="secondary" className="text-xs">
              Masqué
            </Badge>
          )}
        </div>
        <CardAction>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleToggleVisibility}
              title={section.visible ? "Masquer" : "Afficher"}
            >
              {section.visible ? <EyeIcon /> : <EyeOffIcon />}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
              title="Supprimer la section"
            >
              <TrashIcon />
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          {section.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune entrée dans cette section.
            </p>
          ) : (
            section.entries.map((entry) => (
              <EntryEditor
                key={entry.id}
                resumeId={resumeId}
                sectionType={section.type}
                entry={entry}
              />
            ))
          )}

          <AddEntryDialog
            sectionId={section.id}
            sectionType={section.type}
            resumeId={resumeId}
            nextSortOrder={section.entries.length}
          />
        </CardContent>
      )}
    </Card>
  );
}
