"use client";

import { useState } from "react";
import { BriefcaseIcon, Loader2Icon } from "lucide-react";
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

import type { ApplicationStatus } from "@aliko-cv/db/queries";
import { APPLICATION_STATUSES } from "@/lib/application-status";
import { createApplicationAction } from "@/app/actions/applications";

type Props = {
  resumeId: string;
  resumeTitle: string;
};

export function QuickApplyButton({ resumeId, resumeTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [appliedAt, setAppliedAt] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setCompany("");
    setJobTitle("");
    setJobUrl("");
    setStatus("applied");
    setAppliedAt(new Date().toISOString().slice(0, 10));
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
    const res = await createApplicationAction({
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      jobUrl: jobUrl.trim() || null,
      status,
      appliedAt: appliedAt || null,
      resumeId,
    });

    if (res.success) {
      toast.success("Candidature créée !", {
        description: `${company} — ${jobTitle}`,
        action: {
          label: "Voir",
          onClick: () => {
            window.location.href = "/dashboard/applications";
          },
        },
      });
      setOpen(false);
      resetForm();
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <BriefcaseIcon />
            Postuler
          </Button>
        }
      />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Postuler avec ce CV</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          CV : <span className="font-medium text-foreground">{resumeTitle}</span>
        </p>
        <div className="space-y-3">
          <Field>
            <FieldLabel>Entreprise *</FieldLabel>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ex : Google"
              autoFocus
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
              {APPLICATION_STATUSES.filter(
                (s) => s.value !== "archived",
              ).map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
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
          <Button
            onClick={handleSubmit}
            disabled={loading || !company.trim() || !jobTitle.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2Icon className="animate-spin" />
                Création…
              </>
            ) : (
              "Créer la candidature"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
