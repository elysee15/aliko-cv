"use client";

import { useState, useTransition } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
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

export function EntryEditor({ resumeId, sectionType, entry }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateEntryAction(entry.id, resumeId, {
        title: fd.get("title") as string,
        subtitle: (fd.get("subtitle") as string) || null,
        organization: (fd.get("organization") as string) || null,
        location: (fd.get("location") as string) || null,
        startDate: (fd.get("startDate") as string) || null,
        endDate: (fd.get("endDate") as string) || null,
        current: fd.get("current") === "on",
        description: (fd.get("description") as string) || null,
      });
      setExpanded(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteEntryAction(entry.id, resumeId);
    });
  }

  if (!expanded) {
    return (
      <div
        className={`flex items-center justify-between rounded-lg border px-3 py-2 ${isPending ? "opacity-50" : ""}`}
      >
        <button
          type="button"
          className="flex flex-1 items-center gap-2 text-left text-sm"
          onClick={() => setExpanded(true)}
        >
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          <span className="font-medium">{entry.title}</span>
          {entry.organization && (
            <span className="text-muted-foreground">
              — {entry.organization}
            </span>
          )}
        </button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
        >
          <TrashIcon />
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
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
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
        >
          <TrashIcon />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel><Label>Titre</Label></FieldLabel>
          <Input name="title" defaultValue={entry.title} required />
        </Field>

        <Field>
          <FieldLabel><Label>Sous-titre</Label></FieldLabel>
          <Input name="subtitle" defaultValue={entry.subtitle ?? ""} />
        </Field>
      </div>

      {showOrganization.has(sectionType) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel><Label>Organisation</Label></FieldLabel>
            <Input
              name="organization"
              defaultValue={entry.organization ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel><Label>Lieu</Label></FieldLabel>
            <Input name="location" defaultValue={entry.location ?? ""} />
          </Field>
        </div>
      )}

      {showDates.has(sectionType) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel><Label>Date de début</Label></FieldLabel>
            <Input
              type="date"
              name="startDate"
              defaultValue={entry.startDate ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel><Label>Date de fin</Label></FieldLabel>
            <Input
              type="date"
              name="endDate"
              defaultValue={entry.endDate ?? ""}
              disabled={entry.current}
            />
          </Field>
        </div>
      )}

      {showDates.has(sectionType) && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="current"
            defaultChecked={entry.current}
          />
          En cours
        </label>
      )}

      <Field>
        <FieldLabel><Label>Description</Label></FieldLabel>
        <Textarea
          name="description"
          defaultValue={entry.description ?? ""}
          placeholder="Décrivez cette expérience, ce projet…"
          rows={3}
        />
      </Field>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded(false)}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
