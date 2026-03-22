"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
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

import type { ApplicationStatus } from "@aliko-cv/db/queries";
import { APPLICATION_STATUSES } from "@/lib/application-status";
import {
  createApplicationAction,
  updateApplicationAction,
  deleteApplicationAction,
} from "@/app/actions/applications";
import { extractActionError } from "@/lib/action-error";

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

  const createAction = useAction(createApplicationAction, {
    onSuccess: () => {
      toast.success("Candidature créée !");
      setOpen(false);
      resetForm();
      router.refresh();
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const updateAction = useAction(updateApplicationAction, {
    onSuccess: () => {
      toast.success("Candidature mise à jour !");
      setOpen(false);
      router.refresh();
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const delAction = useAction(deleteApplicationAction, {
    onSuccess: () => {
      toast.success("Candidature supprimée.");
      setOpen(false);
      router.refresh();
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const loading =
    createAction.isExecuting ||
    updateAction.isExecuting ||
    delAction.isExecuting;

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

  function handleSubmit() {
    if (!company.trim()) {
      toast.error("L'entreprise est requise.");
      return;
    }
    if (!jobTitle.trim()) {
      toast.error("Le poste est requis.");
      return;
    }

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
      updateAction.execute({ id: editData.id, ...payload });
    } else {
      createAction.execute(payload);
    }
  }

  function handleDelete() {
    if (!editData) return;
    delAction.execute({ id: editData.id });
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
          {coverLetters.length > 0 && (
            <Field>
              <FieldLabel>Lettre de motivation</FieldLabel>
              <Select
                value={coverLetterId || "none"}
                onValueChange={(val) => setCoverLetterId(!val || val === "none" ? "" : val)}
                items={[
                  { value: "none", label: "Aucune" },
                  ...coverLetters.map((cl) => ({ value: cl.id, label: cl.title })),
                ]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {coverLetters.map((cl) => (
                    <SelectItem key={cl.id} value={cl.id}>
                      {cl.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
