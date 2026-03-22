"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  CheckIcon,
  LayoutTemplateIcon,
  PaletteIcon,
  TypeIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";

import { updateResumeAction } from "@/app/actions/resume";
import {
  templateTypes,
  templateLabels,
  templateDescriptions,
  accentColors,
  fontFamilies,
  type TemplateType,
  type FontFamily,
} from "@/lib/schemas/resume";
import { extractActionError } from "@/lib/action-error";
import { templateThumbnails } from "../template-thumbnails";

type Props = {
  resumeId: string;
  currentTemplate: TemplateType;
  currentAccentColor?: string | null;
  currentFontFamily?: string | null;
};

export function TemplateSelector({
  resumeId,
  currentTemplate,
  currentAccentColor,
  currentFontFamily,
}: Props) {
  const { execute, isExecuting } = useAction(updateResumeAction, {
    onSuccess: ({ input }) => {
      const template = input?.template as TemplateType | undefined;
      if (template) {
        toast.success(`Template "${templateLabels[template]}" appliqué.`);
      } else if (input?.accentColor) {
        toast.success("Couleur d'accent mise à jour.");
      } else if (input?.fontFamily) {
        toast.success("Police mise à jour.");
      }
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const accent = currentAccentColor ?? "#6366f1";
  const font = currentFontFamily ?? "inter";

  function handleSelectTemplate(template: TemplateType) {
    if (template === currentTemplate) return;
    execute({ id: resumeId, template });
  }

  function handleSelectColor(color: string) {
    if (color === accent) return;
    execute({ id: resumeId, accentColor: color });
  }

  function handleSelectFont(family: FontFamily) {
    if (family === font) return;
    execute({ id: resumeId, fontFamily: family });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LayoutTemplateIcon className="size-4 text-muted-foreground" />
          <CardTitle>Template & Style</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template grid */}
        <div
          className={`grid gap-3 sm:grid-cols-3 ${isExecuting ? "pointer-events-none opacity-50" : ""}`}
        >
          {templateTypes.map((t) => {
            const isActive = t === currentTemplate;
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleSelectTemplate(t)}
                className={`relative overflow-hidden rounded-none border text-left transition-colors ${
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:border-muted-foreground/30 hover:bg-muted/50"
                }`}
              >
                {isActive && (
                  <CheckIcon className="absolute top-2 right-2 z-10 size-3.5 text-primary" />
                )}
                <div className="h-16 w-full" style={{ color: accent }}>
                  {templateThumbnails[t]}
                </div>
                <div className="border-t p-2">
                  <p className="text-xs font-medium">{templateLabels[t]}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                    {templateDescriptions[t]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <PaletteIcon className="size-3.5 text-muted-foreground" />
            <Label className="text-sm font-medium">Couleur d&apos;accent</Label>
          </div>
          <div
            className={`flex flex-wrap gap-2 ${isExecuting ? "pointer-events-none opacity-50" : ""}`}
          >
            {accentColors.map((c) => {
              const isActive = c.value === accent;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleSelectColor(c.value)}
                  className={`relative size-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    isActive
                      ? "border-foreground ring-2 ring-foreground/20"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {isActive && (
                    <CheckIcon className="absolute inset-0 m-auto size-3.5 text-white drop-shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TypeIcon className="size-3.5 text-muted-foreground" />
            <Label className="text-sm font-medium">Police</Label>
          </div>
          <div
            className={`grid gap-2 sm:grid-cols-3 ${isExecuting ? "pointer-events-none opacity-50" : ""}`}
          >
            {fontFamilies.map((f) => {
              const isActive = f.value === font;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => handleSelectFont(f.value)}
                  className={`relative rounded-none border p-2.5 text-left transition-colors ${
                    isActive
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-muted-foreground/30 hover:bg-muted/50"
                  }`}
                >
                  {isActive && (
                    <CheckIcon className="absolute top-2 right-2 size-3.5 text-primary" />
                  )}
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {f.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
