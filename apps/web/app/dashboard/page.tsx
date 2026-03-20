import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  // Session already enforced by dashboard layout; we only need it for display.
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Bienvenue</h1>
      <p className="text-muted-foreground">
        {user ? (
          <>
            Connecté en tant que <strong>{user.email}</strong>
            {user.name ? ` (${user.name})` : ""}.
          </>
        ) : (
          "Chargement…"
        )}
      </p>
      <p className="text-sm text-muted-foreground">
        Vous pouvez gérer vos CV depuis ici (fonctionnalités à venir).
      </p>
    </div>
  );
}
