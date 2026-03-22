"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import {
  ArrowLeftIcon,
  SaveIcon,
  Loader2Icon,
  PrinterIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import {
  updateCoverLetterAction,
  deleteCoverLetterAction,
} from "@/app/actions/cover-letters";
import { extractActionError } from "@/lib/action-error";

type CoverLetterData = {
  id: string;
  title: string;
  company: string | null;
  jobTitle: string | null;
  resumeId: string | null;
  content: string;
};

type Props = {
  letter: CoverLetterData;
  resumes: { id: string; title: string }[];
  userName: string;
};

export function CoverLetterEditor({ letter, resumes, userName }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(letter.title);
  const [company, setCompany] = useState(letter.company ?? "");
  const [jobTitle, setJobTitle] = useState(letter.jobTitle ?? "");
  const [resumeId, setResumeId] = useState(letter.resumeId ?? "");
  const [content, setContent] = useState(letter.content);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const deleteAction = useAction(deleteCoverLetterAction, {
    onSuccess: () => {
      toast.success("Lettre supprimée.");
      router.push("/dashboard/cover-letters");
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    setSaving(true);
    const result = await updateCoverLetterAction({
      id: letter.id,
      title,
      company: company || null,
      jobTitle: jobTitle || null,
      resumeId: resumeId || null,
      content,
    });
    if (result?.data) {
      setLastSaved(new Date());
    } else if (result?.serverError) {
      toast.error(result.serverError);
    } else if (result?.validationErrors) {
      toast.error("Données invalides.");
    }
    setSaving(false);
  }, [letter.id, title, company, jobTitle, resumeId, content]);

  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      save();
    }, 1500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [title, company, jobTitle, resumeId, content, save]);

  function handleDelete() {
    if (!confirm("Supprimer cette lettre de motivation ?")) return;
    deleteAction.execute({ id: letter.id });
  }

  return (
    <div className="min-h-svh">
      <div className="flex items-center gap-3 border-b px-4 py-3 print:hidden">
        <Link href="/dashboard/cover-letters">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeftIcon />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold line-clamp-1">{title}</h1>
            {lastSaved && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Sauvegardé
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            Sauver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <PrinterIcon />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteAction.isExecuting}
            className="text-destructive hover:text-destructive"
          >
            <TrashIcon />
          </Button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 p-4 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4 print:hidden">
          <Field>
            <FieldLabel>Titre</FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la lettre"
            />
          </Field>
          <Field>
            <FieldLabel>Entreprise</FieldLabel>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nom de l'entreprise"
            />
          </Field>
          <Field>
            <FieldLabel>Poste visé</FieldLabel>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Intitulé du poste"
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
        </div>

        <div className="space-y-4">
          <div className="print:hidden">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Rédigez votre lettre de motivation ici…

Madame, Monsieur,

Suite à votre annonce pour le poste de…"
              rows={20}
              className="min-h-[400px] resize-y font-mono text-sm leading-relaxed"
            />
          </div>

          <div className="hidden print:block">
            <div className="mb-8 space-y-1">
              <p className="font-semibold">{userName}</p>
              {company && (
                <p className="text-sm">
                  À l&apos;attention de : {company}
                </p>
              )}
              {jobTitle && (
                <p className="text-sm">
                  Objet : Candidature au poste de {jobTitle}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
