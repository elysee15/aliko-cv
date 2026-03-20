"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@workspace/ui/components/card";
import { Field, FieldLabel, FieldDescription } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";

import { updateResumeAction } from "@/app/actions/resume";
import { useAutosave } from "@/hooks/use-autosave";
import { AutosaveIndicator } from "@/components/autosave-indicator";

type Props = {
  id: string;
  title: string;
  summary: string | null;
  status: "draft" | "published";
};

export function ResumeHeaderEditor({ id, title, summary, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSummary, setCurrentSummary] = useState(summary ?? "");

  const autosaveData = useMemo(
    () => ({ title: currentTitle, summary: currentSummary || null }),
    [currentTitle, currentSummary],
  );

  const handleAutoSave = useCallback(
    async (data: { title: string; summary: string | null }) => {
      if (!data.title.trim()) return { success: false };
      return updateResumeAction(id, data);
    },
    [id],
  );

  const { status: saveStatus } = useAutosave({
    data: autosaveData,
    onSave: handleAutoSave,
    delay: 800,
    enabled: currentTitle.trim().length > 0,
  });

  function handleToggleStatus() {
    const next = status === "draft" ? "published" : "draft";
    startTransition(async () => {
      const result = await updateResumeAction(id, { status: next });
      if (result.success) {
        toast.success(next === "published" ? "CV publié !" : "Repassé en brouillon.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
        <CardAction>
          <AutosaveIndicator status={saveStatus} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Field>
            <FieldLabel>
              <Label>Titre du CV</Label>
            </FieldLabel>
            <Input
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel>
              <Label>Résumé / Accroche</Label>
            </FieldLabel>
            <Textarea
              value={currentSummary}
              onChange={(e) => setCurrentSummary(e.target.value)}
              placeholder="Quelques lignes qui résument votre profil…"
              rows={3}
            />
            <FieldDescription>
              Optionnel. Apparaît en haut de votre CV.
            </FieldDescription>
          </Field>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleToggleStatus}
          >
            {status === "draft" ? "Publier" : "Repasser en brouillon"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
