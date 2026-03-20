import Link from "next/link";
import { headers } from "next/headers";
import {
  FileTextIcon,
  SparklesIcon,
  GlobeIcon,
  DownloadIcon,
  ArrowRightIcon,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { auth } from "@/lib/auth";

const features = [
  {
    icon: FileTextIcon,
    title: "Éditeur intuitif",
    description:
      "Créez et organisez vos sections librement. Expérience, formation, compétences — tout est personnalisable.",
  },
  {
    icon: GlobeIcon,
    title: "Partage en un clic",
    description:
      "Publiez votre CV avec un lien unique. Partagez-le avec les recruteurs instantanément.",
  },
  {
    icon: DownloadIcon,
    title: "Export PDF",
    description:
      "Générez un PDF propre et professionnel directement depuis votre navigateur.",
  },
];

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isLoggedIn = !!session?.user;

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-primary" />
            <span className="font-heading text-lg font-semibold">Aliko</span>
          </Link>
          <nav className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm">
                  Tableau de bord
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Créer un compte</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
          <div className="mx-auto max-w-2xl space-y-6">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Votre CV,{" "}
              <span className="bg-linear-to-r from-primary/80 to-primary bg-clip-text text-transparent">
                simplement parfait
              </span>
            </h1>
            <p className="mx-auto max-w-lg text-lg text-muted-foreground">
              Créez, personnalisez et partagez votre CV professionnel en
              quelques minutes. Moderne, rapide, gratuit.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href={isLoggedIn ? "/dashboard" : "/sign-up"}>
                <Button size="lg">
                  {isLoggedIn ? "Mes CV" : "Commencer gratuitement"}
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center font-heading text-2xl font-semibold">
              Tout ce qu&apos;il faut pour un CV réussi
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="space-y-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-4 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Aliko</span>
          <span>Construit avec Next.js &amp; Drizzle</span>
        </div>
      </footer>
    </div>
  );
}
