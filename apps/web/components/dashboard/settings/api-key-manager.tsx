"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  KeyIcon,
  PlusIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";

import { createApiKeyAction, revokeApiKeyAction } from "@/app/actions/api-keys";

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
};

type Props = {
  keys: ApiKeyRow[];
};

export function ApiKeyManager({ keys }: Props) {
  const [isPending, startTransition] = useTransition();
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  function handleCreate() {
    if (!newKeyName.trim()) return;
    startTransition(async () => {
      const result = await createApiKeyAction(newKeyName);
      if (result.success) {
        const data = result.data as { rawKey: string };
        setRevealedKey(data.rawKey);
        setNewKeyName("");
        toast.success("Clé API créée !");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRevoke(id: string) {
    startTransition(async () => {
      const result = await revokeApiKeyAction(id);
      if (result.success) {
        toast.success("Clé API révoquée.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Clé copiée !");
    setTimeout(() => setCopied(false), 2000);
  }

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
        {/* Revealed key banner */}
        {revealedKey && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-3 dark:bg-amber-950/20">
            <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
              Copiez cette clé maintenant — elle ne sera plus affichée.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-background px-2 py-1 text-xs">
                {revealedKey}
              </code>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => handleCopy(revealedKey)}
              >
                {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
              </Button>
            </div>
          </div>
        )}

        {/* Existing keys */}
        {keys.length > 0 ? (
          <div className="divide-y rounded-lg border">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between px-3 py-2.5"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{k.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <code>{k.keyPrefix}…</code>
                    {" · "}
                    {k.lastUsedAt
                      ? `Dernier usage : ${new Date(k.lastUsedAt).toLocaleDateString("fr-FR")}`
                      : "Jamais utilisée"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleRevoke(k.id)}
                  title="Révoquer"
                >
                  <TrashIcon className="size-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Aucune clé API active.
          </p>
        )}

        {/* Create form */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              placeholder="Nom de la clé (ex : Mon portfolio)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <Button
            size="sm"
            disabled={isPending || !newKeyName.trim()}
            onClick={handleCreate}
          >
            <PlusIcon />
            Créer
          </Button>
        </div>

        {/* Usage hint */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium">
            Comment utiliser l&apos;API ?
          </summary>
          <div className="mt-2 space-y-2 rounded-lg border bg-muted/40 p-3">
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
