import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@aliko-cv/db/client";
import { getApiKeysByUser, getWebhooksByUser } from "@aliko-cv/db/queries";
import { auth } from "@/lib/auth";
import { ApiKeyManager } from "@/components/dashboard/settings/api-key-manager";
import { WebhookManager } from "@/components/dashboard/settings/webhook-manager";
import { TelegramLink } from "@/components/dashboard/settings/telegram-link";

export const metadata: Metadata = {
  title: "Intégrations — Paramètres",
};

export default async function SettingsIntegrationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

  const [apiKeys, webhooks] = await Promise.all([
    getApiKeysByUser(db, session.user.id),
    getWebhooksByUser(db, session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Intégrations</h2>
        <p className="text-sm text-muted-foreground">
          Connectez vos outils externes via API, webhooks et messagerie.
        </p>
      </div>

      <ApiKeyManager keys={apiKeys} />

      <WebhookManager webhooks={webhooks} />

      <TelegramLink />
    </div>
  );
}
