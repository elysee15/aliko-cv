"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
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
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";

import { createResumeAction } from "@/app/actions/resume";
import { extractActionError } from "@/lib/action-error";

export function CreateResumeDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const router = useRouter();

  const { execute, isExecuting, result } = useAction(createResumeAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success("CV créé !");
        setTitle("");
        setOpen(false);
        router.push(`/dashboard/${data.id}`);
      }
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const titleError = result.validationErrors?.title?._errors?.[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <PlusIcon data-icon="inline-start" />
            Nouveau CV
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un CV</DialogTitle>
          <DialogDescription>
            Donnez un titre à votre nouveau CV pour commencer.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            execute({ title });
          }}
        >
          <Field data-invalid={!!titleError}>
            <FieldLabel>
              <Label>Titre</Label>
            </FieldLabel>
            <Input
              placeholder="Mon CV 2026"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {titleError && <FieldError errors={[{ message: titleError }]} />}
          </Field>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? "Création…" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
