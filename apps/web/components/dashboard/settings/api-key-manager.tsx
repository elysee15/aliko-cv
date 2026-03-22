"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  KeyIcon,
  PlusIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";

import {
  createApiKeyAction,
  revokeApiKeyAction,
} from "@/app/actions/api-keys";
import { extractActionError } from "@/lib/action-error";

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  scope: "read" | "read_write";
  lastUsedAt: Date | null;
  createdAt: Date;
};

type Props = {
  keys: ApiKeyRow[];
};

export function ApiKeyManager({ keys }: Props) {
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState<"read" | "read_write">("read");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const createAction = useAction(createApiKeyAction, {
    onSuccess: ({ data }) => {
      if (data) {
        setRevealedKey(data.rawKey);
        setNewKeyName("");
        toast.success("Clé API créée !");
        router.refresh();
      }
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const revokeAction = useAction(revokeApiKeyAction, {
    onSuccess: () => {
      toast.success("Clé API révoquée.");
      router.refresh();
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const nameError =
    createAction.result.validationErrors?.name?._errors?.[0];

  function handleCreate() {
    createAction.execute({ name: newKeyName, scope: newKeyScope });
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Clé copiée !");
    setTimeout(() => setCopied(false), 2000);
  }

  const nameErrorId = "api-key-name-error";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyIcon className="size-4" />
          Clés API
        </CardTitle>
        <CardDescription>
          Utilisez vos clés pour accéder à vos données CV via l&apos;API REST.
          Endpoint : <code className="text-xs">/api/v1/resumes</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {revealedKey && (
          <div className="rounded-none border border-amber-500/30 bg-amber-50 p-3 dark:bg-amber-950/20">
            <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
              Copiez cette clé maintenant — elle ne sera plus affichée.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-background px-2 py-1 text-xs">
                {revealedKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="min-h-11 min-w-11"
                onClick={() => handleCopy(revealedKey)}
              >
                {copied ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        )}

        {keys.length > 0 ? (
          <div className="divide-y rounded-none border">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between px-3 py-2.5"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{k.name}</p>
                    <Badge variant={k.scope === "read_write" ? "default" : "secondary"} className="text-[10px] leading-tight">
                      {k.scope === "read_write" ? "Lecture + Écriture" : "Lecture"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <code>{k.keyPrefix}…</code>
                    {" · "}
                    {k.lastUsedAt
                      ? `Dernier usage : ${new Date(k.lastUsedAt).toLocaleDateString("fr-FR")}`
                      : "Jamais utilisée"}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="min-h-11 min-w-11"
                        disabled={revokeAction.isExecuting}
                        title="Révoquer"
                      />
                    }
                  >
                    <TrashIcon className="size-3.5 text-destructive" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Révoquer la clé API
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir révoquer la clé «&nbsp;
                        {k.name}&nbsp;» ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => revokeAction.execute({ id: k.id })}
                      >
                        Révoquer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Aucune clé API active.
          </p>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="api-key-name">
              Nom de la clé <span className="text-destructive">*</span>
            </Label>
            <Input
              id="api-key-name"
              placeholder="Ex : Mon portfolio"
              value={newKeyName}
              onChange={(e) => {
                setNewKeyName(e.target.value);
                if (createAction.hasErrored) createAction.reset();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              aria-required="true"
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? nameErrorId : undefined}
            />
            {nameError && (
              <p
                id={nameErrorId}
                role="alert"
                className="mt-1 text-xs text-destructive"
              >
                {nameError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="api-key-scope">Permissions</Label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`rounded-none border px-3 py-1.5 text-sm ${newKeyScope === "read" ? "border-primary bg-primary/10 font-medium" : "text-muted-foreground"}`}
                onClick={() => setNewKeyScope("read")}
              >
                Lecture seule
              </button>
              <button
                type="button"
                className={`rounded-none border px-3 py-1.5 text-sm ${newKeyScope === "read_write" ? "border-primary bg-primary/10 font-medium" : "text-muted-foreground"}`}
                onClick={() => setNewKeyScope("read_write")}
              >
                Lecture + Écriture
              </button>
            </div>
          </div>

          <Button
            size="sm"
            disabled={createAction.isExecuting}
            onClick={handleCreate}
          >
            <PlusIcon />
            {createAction.isExecuting ? "Création…" : "Créer une clé"}
          </Button>
        </div>

        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium">
            Comment utiliser l&apos;API ?
          </summary>
          <div className="mt-2 space-y-2 rounded-none border bg-muted/40 p-3">
            <p>Listez vos CV :</p>
            <pre className="overflow-x-auto rounded bg-background p-2 text-[11px]">
              {`curl -H "Authorization: Bearer ak_votre_cle" \\
  https://votre-domaine/api/v1/resumes`}
            </pre>
            <p>Détail d&apos;un CV :</p>
            <pre className="overflow-x-auto rounded bg-background p-2 text-[11px]">
              {`curl -H "Authorization: Bearer ak_votre_cle" \\
  https://votre-domaine/api/v1/resumes/<id>`}
            </pre>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
