import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@aliko-cv/db/client";
import { getPortfolioByUser } from "@aliko-cv/db/queries";
import { auth } from "@/lib/auth";
import { PortfolioSettings } from "@/components/dashboard/settings/portfolio-settings";

export const metadata: Metadata = {
  title: "Portfolio public — Paramètres",
};

export default async function SettingsPortfolioPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

  const portfolio = await getPortfolioByUser(db, session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Portfolio public</h2>
        <p className="text-sm text-muted-foreground">
          Activez et personnalisez votre page portfolio accessible publiquement.
        </p>
      </div>

      <PortfolioSettings
        enabled={portfolio?.enabled ?? false}
        slug={portfolio?.slug ?? `portfolio-${Date.now().toString(36)}`}
        headline={portfolio?.headline ?? null}
        bio={portfolio?.bio ?? null}
      />
    </div>
  );
}
