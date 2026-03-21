"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { GlobeIcon, ExternalLinkIcon } from "lucide-react";

import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@workspace/ui/components/card";
import { Field, FieldLabel, FieldDescription } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";

import { updatePortfolioAction } from "@/app/actions/portfolio";
import { useAutosave } from "@/hooks/use-autosave";
import { AutosaveIndicator } from "@/components/autosave-indicator";

type Props = {
  enabled: boolean;
  slug: string;
  headline: string | null;
  bio: string | null;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function PortfolioSettings({ enabled, slug, headline, bio }: Props) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [currentHeadline, setCurrentHeadline] = useState(headline ?? "");
  const [currentBio, setCurrentBio] = useState(bio ?? "");

  const autosaveData = useMemo(
    () => ({
      enabled: isEnabled,
      slug: currentSlug,
      headline: currentHeadline || null,
      bio: currentBio || null,
    }),
    [isEnabled, currentSlug, currentHeadline, currentBio],
  );

  const handleAutoSave = useCallback(
    async (data: typeof autosaveData) => {
      if (!data.slug.trim()) return { success: false };
      return updatePortfolioAction(data);
    },
    [],
  );

  const { status: saveStatus } = useAutosave({
    data: autosaveData,
    onSave: handleAutoSave,
    delay: 800,
    enabled: currentSlug.trim().length > 0,
  });

  function handleToggle() {
    const next = !isEnabled;
    setIsEnabled(next);
    toast.success(next ? "Portfolio activé" : "Portfolio désactivé");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GlobeIcon className="size-4" />
          Portfolio public
        </CardTitle>
        <CardAction>
          <AutosaveIndicator status={saveStatus} />
        </CardAction>
        <CardDescription>
          Activez une page publique qui regroupe tous vos CV publiés.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">
              {isEnabled ? "Portfolio activé" : "Portfolio désactivé"}
            </p>
            {isEnabled && (
              <p className="text-xs text-muted-foreground">
                /portfolio/{currentSlug}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEnabled && (
              <a
                href={`/portfolio/${currentSlug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon-sm">
                  <ExternalLinkIcon className="size-3.5" />
                </Button>
              </a>
            )}
            <Button
              variant={isEnabled ? "outline" : "default"}
              size="sm"
              onClick={handleToggle}
            >
              {isEnabled ? "Désactiver" : "Activer"}
            </Button>
          </div>
        </div>

        {isEnabled && (
          <>
            <Field>
              <FieldLabel>
                <Label>URL du portfolio</Label>
              </FieldLabel>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-xs text-muted-foreground">/portfolio/</span>
                <Input
                  value={currentSlug}
                  onChange={(e) => setCurrentSlug(slugify(e.target.value))}
                />
              </div>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Titre / Headline</Label>
              </FieldLabel>
              <Input
                value={currentHeadline}
                onChange={(e) => setCurrentHeadline(e.target.value)}
                placeholder="Ex : Développeur Full-Stack"
              />
              <FieldDescription>
                Affiché sous votre nom sur la page portfolio.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Bio</Label>
              </FieldLabel>
              <Textarea
                value={currentBio}
                onChange={(e) => setCurrentBio(e.target.value)}
                placeholder="Quelques lignes sur vous…"
                rows={3}
              />
            </Field>
          </>
        )}
      </CardContent>
    </Card>
  );
}
