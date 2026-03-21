import { eq, and } from "drizzle-orm";
import { asc, desc } from "drizzle-orm";

import type { Database } from "../client";
import { portfolioSettings } from "../portfolio-schema";
import { resume, resumeSection, resumeEntry } from "../cv-schema";

// ---------------------------------------------------------------------------
// Portfolio settings CRUD
// ---------------------------------------------------------------------------

export async function getPortfolioByUser(db: Database, userId: string) {
  return db.query.portfolioSettings.findFirst({
    where: eq(portfolioSettings.userId, userId),
  });
}

export async function upsertPortfolio(
  db: Database,
  userId: string,
  data: {
    enabled?: boolean;
    slug?: string;
    headline?: string | null;
    bio?: string | null;
  },
) {
  const existing = await getPortfolioByUser(db, userId);

  if (existing) {
    const [row] = await db
      .update(portfolioSettings)
      .set(data)
      .where(eq(portfolioSettings.userId, userId))
      .returning();
    return row;
  }

  const [row] = await db
    .insert(portfolioSettings)
    .values({
      userId,
      slug: data.slug ?? `portfolio-${Date.now().toString(36)}`,
      enabled: data.enabled ?? false,
      headline: data.headline,
      bio: data.bio,
    })
    .returning();
  return row;
}

// ---------------------------------------------------------------------------
// Public portfolio page
// ---------------------------------------------------------------------------

export async function getPublicPortfolio(db: Database, slug: string) {
  const settings = await db.query.portfolioSettings.findFirst({
    where: and(
      eq(portfolioSettings.slug, slug),
      eq(portfolioSettings.enabled, true),
    ),
    with: {
      user: true,
    },
  });

  if (!settings) return null;

  const resumes = await db.query.resume.findMany({
    where: and(
      eq(resume.userId, settings.userId),
      eq(resume.status, "published"),
    ),
    orderBy: desc(resume.updatedAt),
    with: {
      sections: {
        orderBy: asc(resumeSection.sortOrder),
        with: {
          entries: {
            orderBy: asc(resumeEntry.sortOrder),
          },
        },
      },
    },
  });

  return {
    user: {
      name: settings.user.name,
      email: settings.user.email,
      image: settings.user.image,
    },
    headline: settings.headline,
    bio: settings.bio,
    slug: settings.slug,
    resumes,
  };
}
