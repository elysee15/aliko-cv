"use client";

import { useState, useCallback, useTransition } from "react";
import { toast } from "sonner";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon,
  TrashIcon,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardAction,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

import {
  deleteSectionAction,
  updateSectionAction,
  reorderEntriesAction,
} from "@/app/actions/resume";
import { sectionTypeLabels, type SectionType } from "@/lib/schemas/resume";
import { useAutosave } from "@/hooks/use-autosave";
import { AutosaveIndicator } from "@/components/autosave-indicator";
import { SortableEntryEditor } from "./sortable-entry-editor";
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
  dragHandleProps?: Record<string, unknown>;
};

export function SectionEditor({ resumeId, section, dragHandleProps }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [optimisticEntryOrder, setOptimisticEntryOrder] = useState<
    string[] | null
  >(null);
  const [sectionTitle, setSectionTitle] = useState(section.title);

  const entrySensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleTitleSave = useCallback(
    async (data: { title: string }) => {
      return updateSectionAction(section.id, resumeId, { title: data.title });
    },
    [section.id, resumeId],
  );

  const { status: titleStatus } = useAutosave({
    data: { title: sectionTitle },
    onSave: handleTitleSave,
    enabled: sectionTitle.trim().length > 0,
  });

  const entryIds =
    optimisticEntryOrder ?? section.entries.map((e) => e.id);
  const orderedEntries = entryIds
    .map((id) => section.entries.find((e) => e.id === id))
    .filter(Boolean) as Entry[];

  function handleToggleVisibility() {
    startTransition(async () => {
      const result = await updateSectionAction(section.id, resumeId, {
        visible: !section.visible,
      });
      if (!result.success) toast.error(result.error);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSectionAction(section.id, resumeId);
      if (result.success) {
        toast.success("Section supprimée.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleEntryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entryIds.indexOf(active.id as string);
    const newIndex = entryIds.indexOf(over.id as string);
    const newOrder = arrayMove(entryIds, oldIndex, newIndex);

    setOptimisticEntryOrder(newOrder);

    const items = newOrder.map((id, i) => ({ id, sortOrder: i }));

    startTransition(async () => {
      const result = await reorderEntriesAction(resumeId, items);
      setOptimisticEntryOrder(null);
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <Card
      className={isPending ? "pointer-events-none opacity-50" : undefined}
    >
      <CardHeader>
        <div className="flex items-center gap-1">
          {dragHandleProps && (
            <button
              type="button"
              className="cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing"
              aria-label="Réordonner la section"
              {...dragHandleProps}
            >
              <GripVerticalIcon className="size-4" />
            </button>
          )}
          <button
            type="button"
            className="flex items-center gap-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUpIcon className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDownIcon className="size-4 text-muted-foreground" />
            )}
          </button>
          <Input
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            className="h-7 border-transparent bg-transparent px-1 text-sm font-semibold shadow-none hover:border-input focus:border-input"
            aria-label="Titre de la section"
          />
          <Badge variant="outline" className="shrink-0 text-xs">
            {sectionTypeLabels[section.type]}
          </Badge>
          {!section.visible && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Masqué
            </Badge>
          )}
          <AutosaveIndicator status={titleStatus} />
        </div>
        <CardAction>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleToggleVisibility}
              title={section.visible ? "Masquer" : "Afficher"}
              aria-label={section.visible ? "Masquer la section" : "Afficher la section"}
            >
              {section.visible ? <EyeIcon /> : <EyeOffIcon />}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
              title="Supprimer la section"
              aria-label="Supprimer la section"
            >
              <TrashIcon />
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          {orderedEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune entrée dans cette section.
            </p>
          ) : (
            <DndContext
              sensors={entrySensors}
              collisionDetection={closestCenter}
              onDragEnd={handleEntryDragEnd}
            >
              <SortableContext
                items={entryIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {orderedEntries.map((entry) => (
                    <SortableEntryEditor
                      key={entry.id}
                      resumeId={resumeId}
                      sectionType={section.type}
                      entry={entry}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
