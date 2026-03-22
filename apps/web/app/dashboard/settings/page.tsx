import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";
import { ChangeEmailForm } from "@/components/dashboard/settings/change-email-form";
import { ChangePasswordForm } from "@/components/dashboard/settings/change-password-form";

export const metadata: Metadata = {
  title: "Profil & sécurité — Paramètres",
};

export default async function SettingsProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Profil &amp; sécurité</h2>
        <p className="text-sm text-muted-foreground">
          Gérez vos informations personnelles et votre mot de passe.
        </p>
      </div>

      <ProfileForm
        name={session.user.name}
        image={session.user.image ?? null}
      />

      <ChangeEmailForm email={session.user.email} />

      <ChangePasswordForm />
    </div>
  );
}
