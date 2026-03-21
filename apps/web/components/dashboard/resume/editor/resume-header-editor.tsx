"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  PhoneIcon,
  GlobeIcon,
  LinkedinIcon,
  GithubIcon,
  LinkIcon,
} from "lucide-react";

import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@workspace/ui/components/card";
import { Field, FieldLabel, FieldDescription } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";

import { updateResumeAction } from "@/app/actions/resume";
import { useAutosave } from "@/hooks/use-autosave";
import { AutosaveIndicator } from "@/components/autosave-indicator";

type Props = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  phone: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  status: "draft" | "published";
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function ResumeHeaderEditor({
  id,
  title,
  slug,
  summary,
  phone,
  website,
  linkedin,
  github,
  status,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [currentSummary, setCurrentSummary] = useState(summary ?? "");
  const [currentPhone, setCurrentPhone] = useState(phone ?? "");
  const [currentWebsite, setCurrentWebsite] = useState(website ?? "");
  const [currentLinkedin, setCurrentLinkedin] = useState(linkedin ?? "");
  const [currentGithub, setCurrentGithub] = useState(github ?? "");

  const autosaveData = useMemo(
    () => ({
      title: currentTitle,
      slug: currentSlug,
      summary: currentSummary || null,
      phone: currentPhone || null,
      website: currentWebsite || null,
      linkedin: currentLinkedin || null,
      github: currentGithub || null,
    }),
    [currentTitle, currentSlug, currentSummary, currentPhone, currentWebsite, currentLinkedin, currentGithub],
  );

  const handleAutoSave = useCallback(
    async (data: typeof autosaveData) => {
      if (!data.title.trim()) return { success: false };
      return updateResumeAction(id, data);
    },
    [id],
  );

  const { status: saveStatus } = useAutosave({
    data: autosaveData,
    onSave: handleAutoSave,
    delay: 800,
    enabled: currentTitle.trim().length > 0,
  });

  function handleToggleStatus() {
    const next = status === "draft" ? "published" : "draft";
    startTransition(async () => {
      const result = await updateResumeAction(id, { status: next });
      if (result.success) {
        toast.success(next === "published" ? "CV publié !" : "Repassé en brouillon.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
        <CardAction>
          <AutosaveIndicator status={saveStatus} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Field>
            <FieldLabel>
              <Label>Titre du CV</Label>
            </FieldLabel>
            <Input
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel>
              <Label className="inline-flex items-center gap-1.5">
                <LinkIcon className="size-3.5" /> URL publique
              </Label>
            </FieldLabel>
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-xs text-muted-foreground">/cv/</span>
              <Input
                value={currentSlug}
                onChange={(e) => setCurrentSlug(slugify(e.target.value))}
              />
            </div>
            <FieldDescription>
              Le lien public de votre CV sera /cv/{currentSlug}
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel>
              <Label>Résumé / Accroche</Label>
            </FieldLabel>
            <Textarea
              value={currentSummary}
              onChange={(e) => setCurrentSummary(e.target.value)}
              placeholder="Quelques lignes qui résument votre profil…"
              rows={3}
            />
            <FieldDescription>
              Optionnel. Apparaît en haut de votre CV.
            </FieldDescription>
          </Field>

          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-sm font-medium">Coordonnées</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel>
                  <Label className="inline-flex items-center gap-1.5">
                    <PhoneIcon className="size-3.5" /> Téléphone
                  </Label>
                </FieldLabel>
                <Input
                  type="tel"
                  value={currentPhone}
                  onChange={(e) => setCurrentPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                />
              </Field>
              <Field>
                <FieldLabel>
                  <Label className="inline-flex items-center gap-1.5">
                    <GlobeIcon className="size-3.5" /> Site web
                  </Label>
                </FieldLabel>
                <Input
                  type="url"
                  value={currentWebsite}
                  onChange={(e) => setCurrentWebsite(e.target.value)}
                  placeholder="https://monsite.com"
                />
              </Field>
              <Field>
                <FieldLabel>
                  <Label className="inline-flex items-center gap-1.5">
                    <LinkedinIcon className="size-3.5" /> LinkedIn
                  </Label>
                </FieldLabel>
                <Input
                  value={currentLinkedin}
                  onChange={(e) => setCurrentLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/pseudo"
                />
              </Field>
              <Field>
                <FieldLabel>
                  <Label className="inline-flex items-center gap-1.5">
                    <GithubIcon className="size-3.5" /> GitHub
                  </Label>
                </FieldLabel>
                <Input
                  value={currentGithub}
                  onChange={(e) => setCurrentGithub(e.target.value)}
                  placeholder="github.com/pseudo"
                />
              </Field>
            </div>
            <FieldDescription>
              Optionnel. Apparaît dans l&apos;en-tête de votre CV.
            </FieldDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleToggleStatus}
          >
            {status === "draft" ? "Publier" : "Repasser en brouillon"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
