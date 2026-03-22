"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { SectionEditor } from "./section-editor";
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
  source: string;
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
  commentCount?: number;
};

export function SortableSectionEditor({ resumeId, section, commentCount = 0 }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionEditor
        resumeId={resumeId}
        section={section}
        commentCount={commentCount}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
