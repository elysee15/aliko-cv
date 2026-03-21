import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { SettingsNav } from "@/components/dashboard/settings/settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeftIcon />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Paramètres</h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <SettingsNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
