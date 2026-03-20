import { eq } from "drizzle-orm";

import { db, closeDb } from "./client";
import {
  user,
  account,
  resume,
  resumeSection,
  resumeEntry,
} from "./schema";

// ---------------------------------------------------------------------------
// Demo user credentials — use these to sign in after seeding
// ---------------------------------------------------------------------------
const DEMO_USER = {
  id: "seed-demo-user-001",
  name: "Aliko Dangote",
  email: "demo@aliko-cv.local",
};

const DEMO_ACCOUNT = {
  id: "seed-demo-account-001",
  accountId: DEMO_USER.id,
  providerId: "credential",
  userId: DEMO_USER.id,
};

// ---------------------------------------------------------------------------
// CV seed data
// ---------------------------------------------------------------------------

const RESUME_ID = "seed-resume-001";

const resumeData = {
  id: RESUME_ID,
  userId: DEMO_USER.id,
  title: "Ingénieur Full-Stack",
  slug: `ingenieur-full-stack-${Date.now().toString(36)}`,
  summary:
    "Développeur full-stack avec 5 ans d'expérience dans la conception et le développement d'applications web modernes. Passionné par les architectures propres, la performance et l'expérience utilisateur.",
  status: "published" as const,
};

type SectionSeed = {
  id: string;
  resumeId: string;
  type: "experience" | "education" | "skills" | "languages" | "projects" | "certifications" | "volunteering" | "interests" | "custom";
  title: string;
  sortOrder: number;
  visible: boolean;
};

type EntrySeed = {
  sectionId: string;
  title: string;
  subtitle?: string;
  organization?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description?: string;
  sortOrder: number;
  visible: boolean;
};

const sections: SectionSeed[] = [
  {
    id: "seed-section-exp",
    resumeId: RESUME_ID,
    type: "experience",
    title: "Expérience professionnelle",
    sortOrder: 0,
    visible: true,
  },
  {
    id: "seed-section-edu",
    resumeId: RESUME_ID,
    type: "education",
    title: "Formation",
    sortOrder: 1,
    visible: true,
  },
  {
    id: "seed-section-skills",
    resumeId: RESUME_ID,
    type: "skills",
    title: "Compétences techniques",
    sortOrder: 2,
    visible: true,
  },
  {
    id: "seed-section-lang",
    resumeId: RESUME_ID,
    type: "languages",
    title: "Langues",
    sortOrder: 3,
    visible: true,
  },
  {
    id: "seed-section-projects",
    resumeId: RESUME_ID,
    type: "projects",
    title: "Projets personnels",
    sortOrder: 4,
    visible: true,
  },
];

const entries: EntrySeed[] = [
  // Experience
  {
    sectionId: "seed-section-exp",
    title: "Développeur Full-Stack Senior",
    organization: "TechCorp",
    location: "Paris, France",
    startDate: "2022-03-01",
    current: true,
    description:
      "Lead technique d'une équipe de 4 développeurs. Migration d'un monolithe PHP vers une architecture Next.js + API microservices. Réduction du temps de chargement de 60%. Mise en place de CI/CD avec GitHub Actions et déploiement sur Vercel.",
    sortOrder: 0,
    visible: true,
  },
  {
    sectionId: "seed-section-exp",
    title: "Développeur Front-End",
    organization: "StartupLab",
    location: "Lyon, France",
    startDate: "2020-01-15",
    endDate: "2022-02-28",
    current: false,
    description:
      "Développement de l'interface utilisateur d'une plateforme SaaS B2B avec React et TypeScript. Intégration de systèmes de paiement (Stripe). Collaboration étroite avec l'équipe produit pour améliorer l'UX.",
    sortOrder: 1,
    visible: true,
  },
  {
    sectionId: "seed-section-exp",
    title: "Développeur Web Junior",
    organization: "Agence Digitale Plus",
    location: "Marseille, France",
    startDate: "2019-03-01",
    endDate: "2019-12-31",
    current: false,
    description:
      "Réalisation de sites vitrine et e-commerce pour des clients variés. Technologies : WordPress, WooCommerce, HTML/CSS, JavaScript. Gestion directe de la relation client.",
    sortOrder: 2,
    visible: true,
  },

  // Education
  {
    sectionId: "seed-section-edu",
    title: "Master Informatique — Génie Logiciel",
    organization: "Université Claude Bernard Lyon 1",
    location: "Lyon, France",
    startDate: "2017-09-01",
    endDate: "2019-06-30",
    current: false,
    description:
      "Spécialisation en architectures logicielles et systèmes distribués. Mémoire sur l'optimisation des performances d'applications React à grande échelle.",
    sortOrder: 0,
    visible: true,
  },
  {
    sectionId: "seed-section-edu",
    title: "Licence Informatique",
    organization: "Université d'Aix-Marseille",
    location: "Marseille, France",
    startDate: "2014-09-01",
    endDate: "2017-06-30",
    current: false,
    sortOrder: 1,
    visible: true,
  },

  // Skills
  {
    sectionId: "seed-section-skills",
    title: "Front-End",
    description: "React, Next.js, TypeScript, Tailwind CSS, HTML/CSS",
    sortOrder: 0,
    current: false,
    visible: true,
  },
  {
    sectionId: "seed-section-skills",
    title: "Back-End",
    description: "Node.js, PostgreSQL, Drizzle ORM, REST, tRPC",
    sortOrder: 1,
    current: false,
    visible: true,
  },
  {
    sectionId: "seed-section-skills",
    title: "DevOps & Outils",
    description: "Git, GitHub Actions, Docker, Vercel, Turborepo, Bun",
    sortOrder: 2,
    current: false,
    visible: true,
  },

  // Languages
  {
    sectionId: "seed-section-lang",
    title: "Français",
    subtitle: "Langue maternelle",
    sortOrder: 0,
    current: false,
    visible: true,
  },
  {
    sectionId: "seed-section-lang",
    title: "Anglais",
    subtitle: "Courant (C1)",
    sortOrder: 1,
    current: false,
    visible: true,
  },
  {
    sectionId: "seed-section-lang",
    title: "Espagnol",
    subtitle: "Intermédiaire (B1)",
    sortOrder: 2,
    current: false,
    visible: true,
  },

  // Projects
  {
    sectionId: "seed-section-projects",
    title: "Aliko CV",
    description:
      "Application de création de CV en ligne avec Next.js, Drizzle, et Better Auth. Export PDF, partage public, et gestion multi-CV.",
    startDate: "2026-01-01",
    current: true,
    sortOrder: 0,
    visible: true,
  },
  {
    sectionId: "seed-section-projects",
    title: "Budget Tracker",
    description:
      "Application mobile de suivi de budget personnel avec React Native et SQLite. Notifications push et graphiques interactifs.",
    startDate: "2024-06-01",
    endDate: "2024-12-01",
    current: false,
    sortOrder: 1,
    visible: true,
  },
];

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Upsert demo user
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, DEMO_USER.email),
  });

  if (existingUser) {
    console.log(`  ✓ User "${DEMO_USER.email}" already exists (${existingUser.id})`);

    // Clean up existing seed CV data for re-runs
    const existingResume = await db.query.resume.findFirst({
      where: eq(resume.id, RESUME_ID),
    });
    if (existingResume) {
      await db.delete(resume).where(eq(resume.id, RESUME_ID));
      console.log("  ✓ Cleaned up existing seed resume");
    }

    // Reuse existing user ID
    resumeData.userId = existingUser.id;
  } else {
    // Hash password with Bun's built-in hasher
    const passwordHash = await Bun.password.hash("Demo1234!", "bcrypt");

    await db.insert(user).values({
      ...DEMO_USER,
      emailVerified: true,
    });

    await db.insert(account).values({
      ...DEMO_ACCOUNT,
      password: passwordHash,
    });

    console.log(`  ✓ Created user "${DEMO_USER.name}" <${DEMO_USER.email}>`);
    console.log(`    Password: Demo1234!`);
  }

  // Insert resume
  await db.insert(resume).values(resumeData);
  console.log(`  ✓ Created resume "${resumeData.title}"`);

  // Insert sections
  await db.insert(resumeSection).values(sections);
  console.log(`  ✓ Created ${sections.length} sections`);

  // Insert entries
  await db.insert(resumeEntry).values(entries);
  console.log(`  ✓ Created ${entries.length} entries`);

  console.log("\n✅ Seed complete!\n");
  console.log("  Sign in with:");
  console.log(`    Email:    ${DEMO_USER.email}`);
  console.log(`    Password: Demo1234!\n`);
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => closeDb());
