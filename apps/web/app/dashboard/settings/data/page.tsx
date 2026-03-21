import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { DataManagement } from "@/components/dashboard/settings/data-management";

export const metadata: Metadata = {
  title: "Données & RGPD — Paramètres",
};

export default async function SettingsDataPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Données &amp; RGPD</h2>
        <p className="text-sm text-muted-foreground">
          Exportez vos données ou supprimez votre compte.
        </p>
      </div>

      <DataManagement email={session.user.email} />
    </div>
  );
}
