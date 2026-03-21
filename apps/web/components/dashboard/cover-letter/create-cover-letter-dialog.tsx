"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

import { createCoverLetterAction } from "@/app/actions/cover-letters";

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
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }

    setLoading(true);
    const res = await createCoverLetterAction({
      title: title.trim(),
      company: company.trim() || null,
      jobTitle: jobTitle.trim() || null,
      resumeId: resumeId || null,
    });

    if (res.success) {
      toast.success("Lettre créée !");
      setOpen(false);
      setTitle("");
      setCompany("");
      setJobTitle("");
      setResumeId("");
      router.push(`/dashboard/cover-letters/${res.data.id}`);
    } else {
      toast.error(res.error);
    }
    setLoading(false);
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
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="flex h-8 w-full rounded-md border bg-transparent px-3 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Aucun</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Button
            onClick={handleCreate}
            disabled={loading || !title.trim()}
            className="w-full"
          >
            {loading ? (
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
