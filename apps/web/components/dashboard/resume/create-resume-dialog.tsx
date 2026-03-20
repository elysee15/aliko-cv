"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

import {
  createResumeSchema,
  type CreateResumeInput,
} from "@/lib/schemas/resume";
import { createResumeAction } from "@/app/actions/resume";

export function CreateResumeDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateResumeInput>({
    resolver: zodResolver(createResumeSchema),
    defaultValues: { title: "" },
  });

  const router = useRouter();

  function onSubmit(data: CreateResumeInput) {
    startTransition(async () => {
      const result = await createResumeAction(data);
      if (result.success) {
        toast.success("CV créé !");
        reset();
        setOpen(false);
        const resume = result.data as { id: string };
        router.push(`/dashboard/${resume.id}`);
      } else {
        toast.error(result.error);
      }
    });
  }

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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Field data-invalid={!!errors.title}>
            <FieldLabel>
              <Label>Titre</Label>
            </FieldLabel>
            <Input
              placeholder="Mon CV 2026"
              autoFocus
              {...register("title")}
            />
            <FieldError errors={[errors.title]} />
          </Field>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Création…" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
