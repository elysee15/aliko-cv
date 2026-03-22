"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

import { createCoverLetterAction } from "@/app/actions/cover-letters";
import { extractActionError } from "@/lib/action-error";

type Props = {
  resumes?: { id: string; title: string }[];
};

export function CreateCoverLetterDialog({ resumes = [] }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [resumeId, setResumeId] = useState("");

  const { execute, isExecuting } = useAction(createCoverLetterAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success("Lettre créée !");
        setOpen(false);
        setTitle("");
        setCompany("");
        setJobTitle("");
        setResumeId("");
        router.push(`/dashboard/cover-letters/${data.id}`);
      }
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  function handleCreate() {
    if (!title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }
    execute({
      title: title.trim(),
      company: company.trim() || null,
      jobTitle: jobTitle.trim() || null,
      resumeId: resumeId || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <PlusIcon />
            Nouvelle lettre
          </Button>
        }
      />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nouvelle lettre de motivation</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field>
            <FieldLabel>Titre *</FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Candidature Développeur Full-Stack"
            />
          </Field>
          <Field>
            <FieldLabel>Entreprise</FieldLabel>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ex : Google"
            />
          </Field>
          <Field>
            <FieldLabel>Poste visé</FieldLabel>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ex : Développeur Full-Stack"
            />
          </Field>
          {resumes.length > 0 && (
            <Field>
              <FieldLabel>CV associé</FieldLabel>
              <Select
                value={resumeId || "none"}
                onValueChange={(val) => setResumeId(!val || val === "none" ? "" : val)}
                items={[
                  { value: "none", label: "Aucun" },
                  ...resumes.map((r) => ({ value: r.id, label: r.title })),
                ]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Button
            onClick={handleCreate}
            disabled={isExecuting || !title.trim()}
            className="w-full"
          >
            {isExecuting ? (
              <>
                <Loader2Icon className="animate-spin" />
                Création…
              </>
            ) : (
              "Créer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
