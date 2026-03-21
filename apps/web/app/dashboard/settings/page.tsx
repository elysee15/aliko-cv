import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { db } from "@aliko-cv/db/client";
import { getApiKeysByUser, getPortfolioByUser } from "@aliko-cv/db/queries";
import { Button } from "@workspace/ui/components/button";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";
import { ChangePasswordForm } from "@/components/dashboard/settings/change-password-form";
import { ApiKeyManager } from "@/components/dashboard/settings/api-key-manager";
import { PortfolioSettings } from "@/components/dashboard/settings/portfolio-settings";
import { TelegramLink } from "@/components/dashboard/settings/telegram-link";
import { DataManagement } from "@/components/dashboard/settings/data-management";

export const metadata: Metadata = {
  title: "Paramètres",
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

  const [apiKeys, portfolio] = await Promise.all([
    getApiKeysByUser(db, session.user.id),
    getPortfolioByUser(db, session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeftIcon />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Paramètres</h1>
      </div>

      <ProfileForm
        name={session.user.name}
        email={session.user.email}
        image={session.user.image ?? null}
      />

      <ChangePasswordForm />

      <PortfolioSettings
        enabled={portfolio?.enabled ?? false}
        slug={portfolio?.slug ?? `portfolio-${Date.now().toString(36)}`}
        headline={portfolio?.headline ?? null}
        bio={portfolio?.bio ?? null}
      />

      <ApiKeyManager keys={apiKeys} />

      <TelegramLink />

      <DataManagement email={session.user.email} />
    </div>
  );
}
