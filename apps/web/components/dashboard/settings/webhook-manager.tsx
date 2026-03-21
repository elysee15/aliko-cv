"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  WebhookIcon,
  PlusIcon,
  TrashIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  PowerIcon,
  PowerOffIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { Field, FieldLabel } from "@workspace/ui/components/field";

import {
  createWebhookAction,
  deleteWebhookAction,
  toggleWebhookAction,
} from "@/app/actions/webhooks";

const EVENTS = [
  { value: "resume.created", label: "CV créé" },
  { value: "resume.updated", label: "CV mis à jour" },
  { value: "resume.deleted", label: "CV supprimé" },
  { value: "resume.published", label: "CV publié" },
  { value: "resume.exported", label: "CV exporté" },
] as const;

type Webhook = {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggeredAt: Date | null;
  createdAt: Date;
};

type Props = {
  webhooks: Webhook[];
};

export function WebhookManager({ webhooks }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "resume.created",
    "resume.updated",
    "resume.published",
  ]);
  const [creating, setCreating] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event],
    );
  }

  async function handleCreate() {
    setCreating(true);
    const res = await createWebhookAction({ url, events: selectedEvents });
    if (res.success) {
      setNewSecret(res.data.secret);
      setUrl("");
      setSelectedEvents(["resume.created", "resume.updated", "resume.published"]);
      toast.success("Webhook créé !");
      router.refresh();
    } else {
      toast.error(res.error);
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    const res = await deleteWebhookAction(id);
    if (res.success) {
      toast.success("Webhook supprimé.");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  async function handleToggle(id: string, active: boolean) {
    const res = await toggleWebhookAction(id, active);
    if (res.success) {
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  function copySecret() {
    if (!newSecret) return;
    navigator.clipboard.writeText(newSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <WebhookIcon className="size-4" />
            Webhooks
          </CardTitle>
          {!showForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(true);
                setNewSecret(null);
              }}
              disabled={webhooks.length >= 5}
            >
              <PlusIcon />
              Ajouter
            </Button>
          )}
        </div>
        <CardDescription>
          Recevez des notifications HTTP lorsque vos CV changent. Idéal pour
          n8n, Make, Zapier ou votre propre backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

      {/* Secret display (shown once after creation) */}
      {newSecret && (
        <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-600 dark:bg-amber-900/20">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
            Secret de signature (affiché une seule fois) :
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-white/80 px-2 py-1 text-xs dark:bg-black/20">
              {newSecret}
            </code>
            <Button variant="ghost" size="icon-sm" onClick={copySecret}>
              {copiedSecret ? <CheckIcon /> : <CopyIcon />}
            </Button>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Utilisez ce secret pour vérifier la signature HMAC-SHA256 dans
            l&apos;en-tête <code>X-Aliko-Signature</code>.
          </p>
        </div>
      )}

      {/* Creation form */}
      {showForm && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <Field>
            <FieldLabel>URL (HTTPS)</FieldLabel>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.example.com/aliko"
            />
          </Field>
          <div>
            <p className="mb-1.5 text-xs font-medium">Événements</p>
            <div className="flex flex-wrap gap-1.5">
              {EVENTS.map((ev) => (
                <button
                  key={ev.value}
                  type="button"
                  onClick={() => toggleEvent(ev.value)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    selectedEvents.includes(ev.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  {ev.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={creating || !url.trim() || selectedEvents.length === 0}
            >
              {creating ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <PlusIcon />
              )}
              Créer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Webhook list */}
      {webhooks.length > 0 && (
        <div className="space-y-2">
          {webhooks.map((hook) => (
            <div
              key={hook.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-xs font-medium">{hook.url}</p>
                <div className="flex flex-wrap gap-1">
                  {hook.events.map((ev) => (
                    <Badge key={ev} variant="secondary" className="text-[10px]">
                      {EVENTS.find((e) => e.value === ev)?.label ?? ev}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>
                    {hook.active ? "Actif" : "Inactif"}
                  </span>
                  {hook.lastTriggeredAt && (
                    <>
                      <span>·</span>
                      <span>
                        Dernier envoi :{" "}
                        {hook.lastTriggeredAt.toLocaleDateString("fr-FR")}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleToggle(hook.id, !hook.active)}
                  title={hook.active ? "Désactiver" : "Activer"}
                >
                  {hook.active ? <PowerIcon /> : <PowerOffIcon />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(hook.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <TrashIcon />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {webhooks.length === 0 && !showForm && (
        <p className="text-center text-xs text-muted-foreground">
          Aucun webhook configuré.
        </p>
      )}
      </CardContent>
    </Card>
  );
}
