"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

import type { ApplicationStatus } from "@aliko-cv/db/queries";
import { APPLICATION_STATUSES } from "@/lib/application-status";
import {
  createApplicationAction,
  updateApplicationAction,
  deleteApplicationAction,
} from "@/app/actions/applications";

type ApplicationData = {
  id: string;
  company: string;
  jobTitle: string;
  jobUrl?: string | null;
  status: ApplicationStatus;
  appliedAt?: string | null;
  notes?: string | null;
  resumeId?: string | null;
  coverLetterId?: string | null;
};

type Props = {
  resumes?: { id: string; title: string }[];
  coverLetters?: { id: string; title: string }[];
  editData?: ApplicationData | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerHidden?: boolean;
};

export function ApplicationDialog({
  resumes = [],
  coverLetters = [],
  editData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  triggerHidden = false,
}: Props) {
  const router = useRouter();
  const isEdit = !!editData;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("wishlist");
  const [appliedAt, setAppliedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [coverLetterId, setCoverLetterId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && editData) {
      setCompany(editData.company);
      setJobTitle(editData.jobTitle);
      setJobUrl(editData.jobUrl ?? "");
      setStatus(editData.status);
      setAppliedAt(editData.appliedAt ?? "");
      setNotes(editData.notes ?? "");
      setResumeId(editData.resumeId ?? "");
      setCoverLetterId(editData.coverLetterId ?? "");
    } else if (open && !editData) {
      resetForm();
    }
  }, [open, editData]);

  function resetForm() {
    setCompany("");
    setJobTitle("");
    setJobUrl("");
    setStatus("wishlist");
    setAppliedAt("");
    setNotes("");
    setResumeId("");
    setCoverLetterId("");
  }

  async function handleSubmit() {
    if (!company.trim()) {
      toast.error("L'entreprise est requise.");
      return;
    }
    if (!jobTitle.trim()) {
      toast.error("Le poste est requis.");
      return;
    }

    setLoading(true);

    const payload = {
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      jobUrl: jobUrl.trim() || null,
      status,
      appliedAt: appliedAt || null,
      notes: notes.trim() || null,
      resumeId: resumeId || null,
      coverLetterId: coverLetterId || null,
    };

    if (isEdit) {
      const res = await updateApplicationAction({ id: editData.id, ...payload });
      if (res.success) {
        toast.success("Candidature mise à jour !");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } else {
      const res = await createApplicationAction(payload);
      if (res.success) {
        toast.success("Candidature créée !");
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        toast.error(res.error);
      }
    }

    setLoading(false);
  }

  async function handleDelete() {
    if (!editData) return;
    setLoading(true);
    const res = await deleteApplicationAction(editData.id);
    if (res.success) {
      toast.success("Candidature supprimée.");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!triggerHidden && (
        <DialogTrigger
          render={
            <Button size="sm">
              <PlusIcon />
              Nouvelle candidature
            </Button>
          }
        />
      )}
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier la candidature" : "Nouvelle candidature"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field>
            <FieldLabel>Entreprise *</FieldLabel>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ex : Google"
            />
          </Field>
          <Field>
            <FieldLabel>Poste *</FieldLabel>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ex : Développeur Full-Stack"
            />
          </Field>
          <Field>
            <FieldLabel>URL de l'offre</FieldLabel>
            <Input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field>
            <FieldLabel>Statut</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {APPLICATION_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setStatus(s.value);
                    if (
                      s.value !== "wishlist" &&
                      s.value !== "archived" &&
                      !appliedAt
                    ) {
                      setAppliedAt(new Date().toISOString().slice(0, 10));
                    }
                  }}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                    status === s.value
                      ? `${s.bgClass} ring-2 ring-offset-1 ring-current/30`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>
          <Field>
            <FieldLabel>Date de candidature</FieldLabel>
            <Input
              type="date"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
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
          {coverLetters.length > 0 && (
            <Field>
              <FieldLabel>Lettre de motivation</FieldLabel>
              <select
                value={coverLetterId}
                onChange={(e) => setCoverLetterId(e.target.value)}
                className="flex h-8 w-full rounded-md border bg-transparent px-3 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Aucune</option>
                {coverLetters.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.title}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field>
            <FieldLabel>Notes</FieldLabel>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contact, remarques, suivi…"
              rows={3}
              className="resize-none text-xs"
            />
          </Field>
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={loading || !company.trim() || !jobTitle.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  {isEdit ? "Mise à jour…" : "Création…"}
                </>
              ) : isEdit ? (
                "Enregistrer"
              ) : (
                "Créer"
              )}
            </Button>
            {isEdit && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
                className="text-destructive hover:text-destructive"
              >
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
