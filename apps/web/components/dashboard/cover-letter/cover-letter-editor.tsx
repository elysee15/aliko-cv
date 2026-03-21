"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  updateCoverLetterAction,
  deleteCoverLetterAction,
} from "@/app/actions/cover-letters";

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
  const [deleting, setDeleting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    setSaving(true);
    const res = await updateCoverLetterAction({
      id: letter.id,
      title,
      company: company || null,
      jobTitle: jobTitle || null,
      resumeId: resumeId || null,
      content,
    });
    if (res.success) {
      setLastSaved(new Date());
    } else {
      toast.error(res.error);
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

  async function handleDelete() {
    if (!confirm("Supprimer cette lettre de motivation ?")) return;
    setDeleting(true);
    const res = await deleteCoverLetterAction(letter.id);
    if (res.success) {
      toast.success("Lettre supprimée.");
      router.push("/dashboard/cover-letters");
    } else {
      toast.error(res.error);
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-svh">
      {/* Toolbar */}
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
            disabled={deleting}
            className="text-destructive hover:text-destructive"
          >
            <TrashIcon />
          </Button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 p-4 lg:grid-cols-[340px_1fr]">
        {/* Sidebar - metadata */}
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
        </div>

        {/* Main content - editor + preview */}
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

          {/* Print preview */}
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
