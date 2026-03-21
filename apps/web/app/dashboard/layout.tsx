import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BriefcaseIcon, MailIcon, SettingsIcon, SparklesIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-svh">
      <header className="border-b px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <SparklesIcon className="size-4 text-primary" />
            <span className="font-heading font-semibold">Aliko</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {session.user.name || session.user.email}
            </span>
            <ThemeToggle />
            <Link href="/dashboard/applications">
              <Button variant="ghost" size="icon-sm" title="Candidatures">
                <BriefcaseIcon />
              </Button>
            </Link>
            <Link href="/dashboard/cover-letters">
              <Button variant="ghost" size="icon-sm" title="Lettres de motivation">
                <MailIcon />
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="icon-sm" title="Paramètres">
                <SettingsIcon />
              </Button>
            </Link>
            <SignOutButton className="h-auto px-0 text-sm font-normal text-muted-foreground underline-offset-4 hover:bg-transparent hover:text-muted-foreground hover:underline" />
          </div>
        </div>
      </header>
      <main className="p-4 print:p-0">{children}</main>
    </div>
  );
}
