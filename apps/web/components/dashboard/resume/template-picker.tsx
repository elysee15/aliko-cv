"use client";

import { useCallback, useRef } from "react";
import { CheckIcon, FileIcon } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";

import {
  templateTypes,
  templateLabels,
  templateDescriptions,
  atsTemplates,
  type TemplateType,
} from "@/lib/schemas/resume";
import { templateThumbnails } from "./template-thumbnails";

type Props = {
  value: TemplateType | null;
  onValueChange: (value: TemplateType | null) => void;
};

const allOptions: (TemplateType | null)[] = [...templateTypes, null];

export function TemplatePicker({ value, onValueChange }: Props) {
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
      if (!keys.includes(e.key)) return;

      e.preventDefault();
      const currentIdx = allOptions.indexOf(value);
      let nextIdx: number;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextIdx = (currentIdx + 1) % allOptions.length;
      } else {
        nextIdx = (currentIdx - 1 + allOptions.length) % allOptions.length;
      }

      const nextValue = allOptions[nextIdx]!;
      onValueChange(nextValue === undefined ? null : nextValue);

      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      buttons?.[nextIdx]?.focus();
    },
    [value, onValueChange],
  );

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Sélectionner un template"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
      onKeyDown={handleKeyDown}
    >
      {templateTypes.map((t) => {
        const isSelected = value === t;
        const isAts = atsTemplates.has(t);

        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onValueChange(t)}
            className={`relative cursor-pointer overflow-hidden rounded-none border text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:border-muted-foreground/30 hover:bg-muted/50"
            }`}
          >
            {isSelected && (
              <CheckIcon className="absolute top-2 right-2 z-10 size-3.5 text-primary" />
            )}
            <div className="h-14 w-full text-muted-foreground">
              {templateThumbnails[t]}
            </div>
            <div className="border-t px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium">{templateLabels[t]}</p>
                {isAts && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    ATS
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                {templateDescriptions[t]}
              </p>
            </div>
          </button>
        );
      })}

      <button
        type="button"
        role="radio"
        aria-checked={value === null}
        tabIndex={value === null ? 0 : -1}
        onClick={() => onValueChange(null)}
        className={`relative cursor-pointer overflow-hidden rounded-none border text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          value === null
            ? "border-primary bg-primary/5 ring-1 ring-primary"
            : "hover:border-muted-foreground/30 hover:bg-muted/50"
        }`}
      >
        {value === null && (
          <CheckIcon className="absolute top-2 right-2 z-10 size-3.5 text-primary" />
        )}
        <div className="flex h-14 w-full items-center justify-center text-muted-foreground">
          <FileIcon className="size-6 opacity-30" />
        </div>
        <div className="border-t px-2 py-1.5">
          <p className="text-xs font-medium">CV vide</p>
          <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
            Aucune section pré-créée — partez de zéro.
          </p>
        </div>
      </button>
    </div>
  );
}
