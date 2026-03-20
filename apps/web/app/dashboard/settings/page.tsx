import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";
import { ChangePasswordForm } from "@/components/dashboard/settings/change-password-form";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

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
    </div>
  );
}
