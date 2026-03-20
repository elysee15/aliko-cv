"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { EntryEditor } from "./entry-editor";
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

export function SortableEntryEditor({ resumeId, sectionType, entry }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EntryEditor
        resumeId={resumeId}
        sectionType={sectionType}
        entry={entry}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
