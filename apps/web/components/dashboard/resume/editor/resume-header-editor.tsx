"use client";

import { useRef, useTransition } from "react";

import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Field, FieldLabel, FieldDescription } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";

import { updateResumeAction } from "@/app/actions/resume";

type Props = {
  id: string;
  title: string;
  summary: string | null;
  status: "draft" | "published";
};

export function ResumeHeaderEditor({ id, title, summary, status }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateResumeAction(id, {
        title: fd.get("title") as string,
        summary: (fd.get("summary") as string) || null,
      });
    });
  }

  function handleToggleStatus() {
    const next = status === "draft" ? "published" : "draft";
    startTransition(async () => {
      await updateResumeAction(id, { status: next });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Field>
            <FieldLabel>
              <Label>Titre du CV</Label>
            </FieldLabel>
            <Input name="title" defaultValue={title} required />
          </Field>

          <Field>
            <FieldLabel>
              <Label>Résumé / Accroche</Label>
            </FieldLabel>
            <Textarea
              name="summary"
              defaultValue={summary ?? ""}
              placeholder="Quelques lignes qui résument votre profil…"
              rows={3}
            />
            <FieldDescription>
              Optionnel. Apparaît en haut de votre CV.
            </FieldDescription>
          </Field>

          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
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
        </form>
      </CardContent>
    </Card>
  );
}
