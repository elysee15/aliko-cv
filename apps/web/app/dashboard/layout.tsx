import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
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
      <header className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Tableau de bord</span>
          <SignOutButton className="h-auto px-0 text-sm font-normal text-muted-foreground underline-offset-4 hover:bg-transparent hover:text-muted-foreground hover:underline" />
        </div>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
