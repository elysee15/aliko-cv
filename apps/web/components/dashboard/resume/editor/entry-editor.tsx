"use client";

import { useState, useCallback } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GripVerticalIcon,
  TrashIcon,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";

import {
  deleteEntryAction,
  updateEntryAction,
} from "@/app/actions/resume";
import type { SectionType } from "@/lib/schemas/resume";
import { useAutosave } from "@/hooks/use-autosave";
import { AutosaveIndicator } from "@/components/autosave-indicator";

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
  sectionType: SectionType;
  entry: Entry;
  dragHandleProps?: Record<string, unknown>;
};

const showDates = new Set<SectionType>([
  "experience",
  "education",
  "projects",
  "certifications",
  "volunteering",
]);

const showOrganization = new Set<SectionType>([
  "experience",
  "education",
  "certifications",
  "volunteering",
]);

type EntryFormData = {
  title: string;
  subtitle: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

function entryToForm(entry: Entry): EntryFormData {
  return {
    title: entry.title,
    subtitle: entry.subtitle ?? "",
    organization: entry.organization ?? "",
    location: entry.location ?? "",
    startDate: entry.startDate ?? "",
    endDate: entry.endDate ?? "",
    current: entry.current,
    description: entry.description ?? "",
  };
}

export function EntryEditor({ resumeId, sectionType, entry, dragHandleProps }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<EntryFormData>(() => entryToForm(entry));

  const handleSave = useCallback(
    async (data: EntryFormData) => {
      return updateEntryAction(entry.id, resumeId, {
        title: data.title,
        subtitle: data.subtitle || null,
        organization: data.organization || null,
        location: data.location || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        current: data.current,
        description: data.description || null,
      });
    },
    [entry.id, resumeId],
  );

  const { status } = useAutosave({
    data: form,
    onSave: handleSave,
    enabled: expanded && form.title.trim().length > 0,
  });

  function update(patch: Partial<EntryFormData>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEntryAction(entry.id, resumeId);
      if (result.success) {
        toast.success("Entrée supprimée.");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!expanded) {
    return (
      <div
        className={`flex items-center gap-1 rounded-lg border px-2 py-2 ${isPending ? "opacity-50" : ""}`}
      >
        {dragHandleProps && (
          <button
            type="button"
            className="cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing"
            aria-label="Réordonner"
            {...dragHandleProps}
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          className="flex flex-1 items-center gap-2 text-left text-sm"
          onClick={() => setExpanded(true)}
        >
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          <span className="font-medium">{form.title || entry.title}</span>
          {(form.organization || entry.organization) && (
            <span className="text-muted-foreground">
              — {form.organization || entry.organization}
            </span>
          )}
        </button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
          aria-label="Supprimer l'entrée"
        >
          <TrashIcon />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`space-y-3 rounded-lg border p-3 ${isPending ? "pointer-events-none opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium"
          onClick={() => setExpanded(false)}
        >
          <ChevronUpIcon className="size-3.5 text-muted-foreground" />
          Modifier l&apos;entrée
        </button>
        <div className="flex items-center gap-2">
          <AutosaveIndicator status={status} />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
            aria-label="Supprimer l'entrée"
          >
            <TrashIcon />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel><Label>Titre</Label></FieldLabel>
          <Input
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            required
          />
        </Field>

        <Field>
          <FieldLabel><Label>Sous-titre</Label></FieldLabel>
          <Input
            value={form.subtitle}
            onChange={(e) => update({ subtitle: e.target.value })}
          />
        </Field>
      </div>

      {showOrganization.has(sectionType) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel><Label>Organisation</Label></FieldLabel>
            <Input
              value={form.organization}
              onChange={(e) => update({ organization: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel><Label>Lieu</Label></FieldLabel>
            <Input
              value={form.location}
              onChange={(e) => update({ location: e.target.value })}
            />
          </Field>
        </div>
      )}

      {showDates.has(sectionType) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel><Label>Date de début</Label></FieldLabel>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => update({ startDate: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel><Label>Date de fin</Label></FieldLabel>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => update({ endDate: e.target.value })}
              disabled={form.current}
            />
          </Field>
        </div>
      )}

      {showDates.has(sectionType) && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.current}
            onChange={(e) =>
              update({ current: e.target.checked, ...(e.target.checked ? { endDate: "" } : {}) })
            }
          />
          En cours
        </label>
      )}

      <Field>
        <FieldLabel><Label>Description</Label></FieldLabel>
        <Textarea
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Décrivez cette expérience, ce projet…"
          rows={3}
        />
      </Field>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setExpanded(false)}
      >
        Replier
      </Button>
    </div>
  );
}
