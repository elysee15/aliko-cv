"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  SendIcon,
  LinkIcon,
  UnlinkIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

import {
  generateTelegramTokenAction,
  getTelegramStatusAction,
  unlinkTelegramAction,
} from "@/app/actions/telegram";
import { extractActionError } from "@/lib/action-error";

type Props = {
  botUsername?: string;
};

export function TelegramLink({ botUsername }: Props) {
  const [linked, setLinked] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const statusAction = useAction(getTelegramStatusAction, {
    onSuccess: ({ data }) => {
      if (data) {
        setLinked(data.linked);
        setUsername(data.username ?? null);
      }
    },
  });

  const generateAction = useAction(generateTelegramTokenAction, {
    onSuccess: ({ data }) => {
      if (data) {
        setToken(data.token);
        toast.success("Token généré ! Valide 10 minutes.");
      }
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const unlinkAction = useAction(unlinkTelegramAction, {
    onSuccess: () => {
      setLinked(false);
      setUsername(null);
      toast.success("Compte Telegram délié.");
      router.refresh();
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  useEffect(() => {
    statusAction.execute();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isPending =
    generateAction.isExecuting || unlinkAction.isExecuting;

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copié !");
    setTimeout(() => setCopied(false), 2000);
  }

  const startCommand = token ? `/start ${token}` : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SendIcon className="size-4" />
          Telegram
        </CardTitle>
        <CardDescription>
          Liez votre compte Telegram pour mettre à jour votre CV par message.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {linked ? (
          <div className="flex items-center justify-between rounded-none border p-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">Lié</Badge>
              <span className="text-sm">
                {username ? `@${username}` : "Compte Telegram lié"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => unlinkAction.execute()}
            >
              <UnlinkIcon />
              Délier
            </Button>
          </div>
        ) : (
          <>
            {!token ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Générez un token de liaison, puis envoyez-le au bot Telegram.
                </p>
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => generateAction.execute()}
                >
                  <LinkIcon />
                  Générer un token
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-none border bg-muted/40 p-3 text-sm">
                  <p className="font-medium">Étape 1</p>
                  <p className="mt-1 text-muted-foreground">
                    Ouvrez le bot Telegram :{" "}
                    {botUsername ? (
                      <a
                        href={`https://t.me/${botUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2"
                      >
                        @{botUsername}
                      </a>
                    ) : (
                      "Configurez TELEGRAM_BOT_TOKEN pour activer"
                    )}
                  </p>
                </div>

                <div className="rounded-none border bg-muted/40 p-3 text-sm">
                  <p className="font-medium">Étape 2</p>
                  <p className="mt-1 text-muted-foreground">
                    Envoyez cette commande au bot :
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 rounded bg-background px-2 py-1 text-xs">
                      {startCommand}
                    </code>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => handleCopy(startCommand)}
                    >
                      {copied ? (
                        <CheckIcon className="size-3.5" />
                      ) : (
                        <CopyIcon className="size-3.5" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Ce token expire dans 10 minutes.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium">
            Commandes disponibles
          </summary>
          <div className="mt-2 space-y-1 rounded-none border bg-muted/40 p-3">
            <p><code>/list</code> — Lister vos CV</p>
            <p><code>/add &lt;id&gt; skill React</code> — Ajouter une compétence</p>
            <p><code>/add &lt;id&gt; experience Dev chez Google</code> — Ajouter une expérience</p>
            <p><code>/add &lt;id&gt; language Anglais</code> — Ajouter une langue</p>
            <p><code>/help</code> — Aide</p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
