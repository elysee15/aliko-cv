"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckIcon, LayoutTemplateIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { updateResumeAction } from "@/app/actions/resume";
import {
  templateTypes,
  templateLabels,
  templateDescriptions,
  type TemplateType,
} from "@/lib/schemas/resume";

type Props = {
  resumeId: string;
  currentTemplate: TemplateType;
};

export function TemplateSelector({ resumeId, currentTemplate }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(template: TemplateType) {
    if (template === currentTemplate) return;
    startTransition(async () => {
      const result = await updateResumeAction(resumeId, { template });
      if (result.success) {
        toast.success(`Template "${templateLabels[template]}" appliqué.`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LayoutTemplateIcon className="size-4 text-muted-foreground" />
          <CardTitle>Template</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`grid gap-3 sm:grid-cols-3 ${isPending ? "pointer-events-none opacity-50" : ""}`}
        >
          {templateTypes.map((t) => {
            const isActive = t === currentTemplate;
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleSelect(t)}
                className={`relative rounded-none border p-3 text-left transition-colors ${
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:border-muted-foreground/30 hover:bg-muted/50"
                }`}
              >
                {isActive && (
                  <CheckIcon className="absolute top-2 right-2 size-4 text-primary" />
                )}
                <p className="text-sm font-medium">{templateLabels[t]}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {templateDescriptions[t]}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
