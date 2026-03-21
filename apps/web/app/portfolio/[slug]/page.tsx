import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { FileTextIcon, DownloadIcon, SparklesIcon } from "lucide-react";

import { db } from "@aliko-cv/db/client";
import { getPublicPortfolio } from "@aliko-cv/db/queries";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await getPublicPortfolio(db, slug);

  if (!portfolio) return { title: "Portfolio introuvable" };

  const title = `${portfolio.user.name} — Portfolio`;
  const description =
    portfolio.bio ?? portfolio.headline ?? `Portfolio de ${portfolio.user.name}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const portfolio = await getPublicPortfolio(db, slug);

  if (!portfolio) notFound();

  return (
    <div className="min-h-svh bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          {portfolio.user.image && (
            <img
              src={portfolio.user.image}
              alt={portfolio.user.name}
              className="mx-auto mb-4 size-20 rounded-full object-cover"
            />
          )}
          <h1 className="font-heading text-3xl font-bold">
            {portfolio.user.name}
          </h1>
          {portfolio.headline && (
            <p className="mt-2 text-lg text-muted-foreground">
              {portfolio.headline}
            </p>
          )}
          {portfolio.bio && (
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {portfolio.bio}
            </p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {portfolio.user.email}
          </p>
        </div>
      </header>

      {/* CV list */}
      <main className="mx-auto max-w-4xl px-4 py-10">
        {portfolio.resumes.length === 0 ? (
          <div className="py-16 text-center">
            <FileTextIcon className="mx-auto mb-3 size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Aucun CV publié pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="font-heading text-xl font-semibold">
              CV publiés ({portfolio.resumes.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {portfolio.resumes.map((r) => {
                const sectionCount = r.sections.length;
                const entryCount = r.sections.reduce(
                  (sum, s) => sum + s.entries.length,
                  0,
                );
                return (
                  <Link
                    key={r.id}
                    href={`/cv/${r.slug}`}
                    className="group rounded-none border bg-background p-5 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium group-hover:text-primary">
                          {r.title}
                        </h3>
                        {r.summary && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {r.summary}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {r.template}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{sectionCount} section(s)</span>
                      <span>·</span>
                      <span>{entryCount} entrée(s)</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button variant="outline" size="sm" className="pointer-events-none">
                        <FileTextIcon className="size-3" />
                        Voir le CV
                      </Button>
                      {r.phone || r.website || r.linkedin || r.github ? (
                        <Button variant="ghost" size="sm" className="pointer-events-none">
                          <DownloadIcon className="size-3" />
                          Contact
                        </Button>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 text-xs text-muted-foreground">
          <SparklesIcon className="size-3" />
          <span>Propulsé par Aliko CV</span>
        </div>
      </footer>
    </div>
  );
}
