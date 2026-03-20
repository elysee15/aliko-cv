"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";

import { createEntryAction } from "@/app/actions/resume";
import type { SectionType } from "@/lib/schemas/resume";

type Props = {
  sectionId: string;
  sectionType: SectionType;
  resumeId: string;
  nextSortOrder: number;
};

export function AddEntryDialog({
  sectionId,
  resumeId,
  nextSortOrder,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string).trim();
    if (!title) return;

    startTransition(async () => {
      const result = await createEntryAction(
        {
          sectionId,
          title,
          sortOrder: nextSortOrder,
        },
        resumeId,
      );
      if (result.success) {
        toast.success("Entrée ajoutée.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="w-full">
            <PlusIcon data-icon="inline-start" />
            Ajouter une entrée
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle entrée</DialogTitle>
          <DialogDescription>
            Ajoutez un élément à cette section.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Field>
            <FieldLabel>
              <Label>Titre</Label>
            </FieldLabel>
            <Input
              name="title"
              placeholder="Ex: Développeur Full-Stack"
              autoFocus
              required
            />
          </Field>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Ajout…" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
