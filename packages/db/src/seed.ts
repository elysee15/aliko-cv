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
// Seed for existing user (your account)
// ---------------------------------------------------------------------------

const MY_USER_ID = "yDI1eVQs3q2hbUIlPgx3KWVeZlhaVGt7";
const MY_RESUME_ID = "seed-resume-my-001";
const MY_RESUME_ID_2 = "seed-resume-my-002";
const MY_RESUME_ID_3 = "seed-resume-my-003";

const myResumeSections: SectionSeed[] = [
  {
    id: "seed-my-section-exp",
    resumeId: MY_RESUME_ID,
    type: "experience",
    title: "Expérience professionnelle",
    sortOrder: 0,
    visible: true,
  },
  {
    id: "seed-my-section-edu",
    resumeId: MY_RESUME_ID,
    type: "education",
    title: "Formation",
    sortOrder: 1,
    visible: true,
  },
  {
    id: "seed-my-section-skills",
    resumeId: MY_RESUME_ID,
    type: "skills",
    title: "Compétences techniques",
    sortOrder: 2,
    visible: true,
  },
  {
    id: "seed-my-section-lang",
    resumeId: MY_RESUME_ID,
    type: "languages",
    title: "Langues",
    sortOrder: 3,
    visible: true,
  },
  {
    id: "seed-my-section-projects",
    resumeId: MY_RESUME_ID,
    type: "projects",
    title: "Projets",
    sortOrder: 4,
    visible: true,
  },
  {
    id: "seed-my-section-interests",
    resumeId: MY_RESUME_ID,
    type: "interests",
    title: "Centres d'intérêt",
    sortOrder: 5,
    visible: true,
  },
];

const myResumeEntries: EntrySeed[] = [
  // Experience
  {
    sectionId: "seed-my-section-exp",
    title: "Développeur Full-Stack",
    organization: "Freelance",
    location: "Remote",
    startDate: "2023-06-01",
    current: true,
    description:
      "Conception et développement d'applications web sur mesure pour des startups et PME. Stack principale : Next.js, TypeScript, PostgreSQL, Tailwind CSS. Mise en place d'architectures monorepo avec Turborepo. Intégration de systèmes d'authentification (Better Auth) et de paiement (Stripe).",
    sortOrder: 0,
    visible: true,
  },
  {
    sectionId: "seed-my-section-exp",
    title: "Développeur Front-End",
    organization: "Digital Agency",
    location: "Paris, France",
    startDate: "2021-09-01",
    endDate: "2023-05-31",
    current: false,
    description:
      "Développement d'interfaces utilisateur réactives avec React et Next.js. Refonte complète de l'UI d'une application SaaS (+ 40% de rétention utilisateur). Collaboration avec les designers pour implémenter des design systems cohérents.",
    sortOrder: 1,
    visible: true,
  },
  {
    sectionId: "seed-my-section-exp",
    title: "Stagiaire Développeur Web",
    organization: "Tech Startup",
    location: "Lyon, France",
    startDate: "2021-02-01",
    endDate: "2021-07-31",
    current: false,
    description:
      "Développement de fonctionnalités front-end et back-end sur une application Node.js/React. Écriture de tests unitaires et d'intégration. Participation aux code reviews et aux sprints agile.",
    sortOrder: 2,
    visible: true,
  },

  // Education
  {
    sectionId: "seed-my-section-edu",
    title: "Master Développement Web & Mobile",
    organization: "École Supérieure du Numérique",
    location: "Paris, France",
    startDate: "2019-09-01",
    endDate: "2021-06-30",
    current: false,
    description:
      "Spécialisation en développement d'applications web et mobile. Projet de fin d'études : plateforme collaborative de gestion de projets en temps réel.",
    sortOrder: 0,
    visible: true,
  },
  {
    sectionId: "seed-my-section-edu",
    title: "Licence Informatique",
    organization: "Université Paris-Saclay",
    location: "Orsay, France",
    startDate: "2016-09-01",
    endDate: "2019-06-30",
    current: false,
    sortOrder: 1,
    visible: true,
  },

  // Skills
  {
    sectionId: "seed-my-section-skills",
    title: "Front-End",
    description: "React, Next.js, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion",
    sortOrder: 0,
    current: false,
    visible: true,
  },
  {
    sectionId: "seed-my-section-skills",
    title: "Back-End",
    description: "Node.js, PostgreSQL, Drizzle ORM, Better Auth, tRPC, REST API",
    sortOrder: 1,
    current: false,
    visible: true,
  },
  {
    sectionId: "seed-my-section-skills",
    title: "DevOps & Outils",
    description: "Git, GitHub Actions, Docker, Vercel, Turborepo, Bun, Figma",
    sortOrder: 2,
    current: false,
    visible: true,
  },

  // Languages
  {
    sectionId: "seed-my-section-lang",
    title: "Français",
    subtitle: "Langue maternelle",
    sortOrder: 0,
    current: false,
    visible: true,
  },
  {
    sectionId: "seed-my-section-lang",
    title: "Anglais",
    subtitle: "Courant (C1)",
    sortOrder: 1,
    current: false,
    visible: true,
  },

  // Projects
  {
    sectionId: "seed-my-section-projects",
    title: "Aliko CV",
    description:
      "Application de création de CV en ligne. Next.js 16, Drizzle ORM, Better Auth, Turborepo. Prévisualisation temps réel, export PDF, partage via lien public.",
    startDate: "2026-03-01",
    current: true,
    sortOrder: 0,
    visible: true,
  },
  {
    sectionId: "seed-my-section-projects",
    title: "Task Flow",
    description:
      "Application de gestion de tâches collaborative avec drag & drop, notifications en temps réel (WebSocket), et tableaux Kanban personnalisables.",
    startDate: "2025-01-01",
    endDate: "2025-09-01",
    current: false,
    sortOrder: 1,
    visible: true,
  },

  // Interests
  {
    sectionId: "seed-my-section-interests",
    title: "Open Source",
    description: "Contributions à des projets React et Next.js",
    sortOrder: 0,
    current: false,
    visible: true,
  },
  {
    sectionId: "seed-my-section-interests",
    title: "Veille technologique",
    description: "Architecture logicielle, design systems, IA générative",
    sortOrder: 1,
    current: false,
    visible: true,
  },
];

// ---------------------------------------------------------------------------
// CV #2 — UI/UX Designer & Front-End (draft)
// ---------------------------------------------------------------------------

const myResume2Sections: SectionSeed[] = [
  { id: "seed-my2-section-exp", resumeId: MY_RESUME_ID_2, type: "experience", title: "Expérience", sortOrder: 0, visible: true },
  { id: "seed-my2-section-edu", resumeId: MY_RESUME_ID_2, type: "education", title: "Formation", sortOrder: 1, visible: true },
  { id: "seed-my2-section-skills", resumeId: MY_RESUME_ID_2, type: "skills", title: "Compétences", sortOrder: 2, visible: true },
  { id: "seed-my2-section-certs", resumeId: MY_RESUME_ID_2, type: "certifications", title: "Certifications", sortOrder: 3, visible: true },
  { id: "seed-my2-section-lang", resumeId: MY_RESUME_ID_2, type: "languages", title: "Langues", sortOrder: 4, visible: true },
];

const myResume2Entries: EntrySeed[] = [
  {
    sectionId: "seed-my2-section-exp",
    title: "UI/UX Designer & Front-End Developer",
    organization: "Creative Studio",
    location: "Paris, France",
    startDate: "2024-01-01",
    current: true,
    description:
      "Design et intégration d'interfaces pour des applications SaaS. Création de design systems complets dans Figma. Prototypage interactif et tests utilisateurs. Implémentation pixel-perfect avec React et Tailwind CSS.",
    sortOrder: 0,
    visible: true,
  },
  {
    sectionId: "seed-my2-section-exp",
    title: "Web Designer",
    organization: "Studio Graphique",
    location: "Bordeaux, France",
    startDate: "2022-03-01",
    endDate: "2023-12-31",
    current: false,
    description:
      "Conception de sites web pour des marques de luxe et de mode. Maquettage Figma, animations CSS avancées, intégration responsive. Collaboration avec les directeurs artistiques.",
    sortOrder: 1,
    visible: true,
  },
  {
    sectionId: "seed-my2-section-exp",
    title: "Intégrateur Web",
    organization: "Agence Web 360",
    location: "Toulouse, France",
    startDate: "2020-09-01",
    endDate: "2022-02-28",
    current: false,
    description:
      "Intégration HTML/CSS/JS de maquettes. Développement de thèmes WordPress sur mesure. Optimisation des performances front-end (Core Web Vitals).",
    sortOrder: 2,
    visible: true,
  },
  {
    sectionId: "seed-my2-section-edu",
    title: "Bachelor Design Numérique",
    organization: "École de Design Nantes Atlantique",
    location: "Nantes, France",
    startDate: "2017-09-01",
    endDate: "2020-06-30",
    current: false,
    description: "Spécialisation en design d'interfaces et expérience utilisateur. Mention Bien.",
    sortOrder: 0,
    visible: true,
  },
  {
    sectionId: "seed-my2-section-skills",
    title: "Design",
    description: "Figma, Adobe XD, Photoshop, Illustrator, Design Systems, Prototypage",
    sortOrder: 0, current: false, visible: true,
  },
  {
    sectionId: "seed-my2-section-skills",
    title: "Front-End",
    description: "React, Next.js, Tailwind CSS, Framer Motion, GSAP, CSS Animations",
    sortOrder: 1, current: false, visible: true,
  },
  {
    sectionId: "seed-my2-section-skills",
    title: "Méthodologies",
    description: "Design Thinking, Atomic Design, Accessibilité (WCAG), Tests utilisateurs",
    sortOrder: 2, current: false, visible: true,
  },
  {
    sectionId: "seed-my2-section-certs",
    title: "Google UX Design Professional Certificate",
    organization: "Google / Coursera",
    startDate: "2023-06-01",
    endDate: "2023-09-01",
    current: false,
    sortOrder: 0, visible: true,
  },
  {
    sectionId: "seed-my2-section-certs",
    title: "Meta Front-End Developer Certificate",
    organization: "Meta / Coursera",
    startDate: "2022-01-01",
    endDate: "2022-04-01",
    current: false,
    sortOrder: 1, visible: true,
  },
  {
    sectionId: "seed-my2-section-lang",
    title: "Français", subtitle: "Langue maternelle",
    sortOrder: 0, current: false, visible: true,
  },
  {
    sectionId: "seed-my2-section-lang",
    title: "Anglais", subtitle: "Courant (C1)",
    sortOrder: 1, current: false, visible: true,
  },
  {
    sectionId: "seed-my2-section-lang",
    title: "Japonais", subtitle: "Notions (A2)",
    sortOrder: 2, current: false, visible: true,
  },
];

// ---------------------------------------------------------------------------
// CV #3 — Data Engineer (published)
// ---------------------------------------------------------------------------

const myResume3Sections: SectionSeed[] = [
  { id: "seed-my3-section-exp", resumeId: MY_RESUME_ID_3, type: "experience", title: "Expérience professionnelle", sortOrder: 0, visible: true },
  { id: "seed-my3-section-edu", resumeId: MY_RESUME_ID_3, type: "education", title: "Formation", sortOrder: 1, visible: true },
  { id: "seed-my3-section-skills", resumeId: MY_RESUME_ID_3, type: "skills", title: "Stack technique", sortOrder: 2, visible: true },
  { id: "seed-my3-section-projects", resumeId: MY_RESUME_ID_3, type: "projects", title: "Projets open source", sortOrder: 3, visible: true },
  { id: "seed-my3-section-lang", resumeId: MY_RESUME_ID_3, type: "languages", title: "Langues", sortOrder: 4, visible: true },
  { id: "seed-my3-section-vol", resumeId: MY_RESUME_ID_3, type: "volunteering", title: "Bénévolat", sortOrder: 5, visible: true },
];

const myResume3Entries: EntrySeed[] = [
  {
    sectionId: "seed-my3-section-exp",
    title: "Data Engineer",
    organization: "DataScale",
    location: "Remote, Europe",
    startDate: "2023-09-01",
    current: true,
    description:
      "Conception et maintenance de pipelines de données traitant 50M+ événements/jour. Migration de l'infrastructure data de Spark on-premise vers Databricks. Réduction des coûts cloud de 35% par optimisation des requêtes et du partitionnement.",
    sortOrder: 0, visible: true,
  },
  {
    sectionId: "seed-my3-section-exp",
    title: "Développeur Back-End / Data",
    organization: "FinTech Corp",
    location: "Paris, France",
    startDate: "2021-06-01",
    endDate: "2023-08-31",
    current: false,
    description:
      "Développement d'APIs REST et GraphQL en Python (FastAPI). Mise en place d'un data warehouse avec dbt et BigQuery. Automatisation des rapports financiers et dashboards Metabase.",
    sortOrder: 1, visible: true,
  },
  {
    sectionId: "seed-my3-section-exp",
    title: "Analyste Data Junior",
    organization: "Conseil & Stratégie",
    location: "Lyon, France",
    startDate: "2020-01-01",
    endDate: "2021-05-31",
    current: false,
    description:
      "Analyse de données clients pour des grands comptes bancaires. SQL avancé, Python (pandas, matplotlib). Création de dashboards Power BI et automatisation de reporting.",
    sortOrder: 2, visible: true,
  },
  {
    sectionId: "seed-my3-section-edu",
    title: "Master Data Science & Intelligence Artificielle",
    organization: "EPITA",
    location: "Paris, France",
    startDate: "2018-09-01",
    endDate: "2020-06-30",
    current: false,
    description: "Machine learning, deep learning, traitement du langage naturel. Projet de fin d'études : système de détection de fraude en temps réel.",
    sortOrder: 0, visible: true,
  },
  {
    sectionId: "seed-my3-section-edu",
    title: "Licence Mathématiques Appliquées",
    organization: "Université Lyon 1",
    location: "Lyon, France",
    startDate: "2015-09-01",
    endDate: "2018-06-30",
    current: false,
    sortOrder: 1, visible: true,
  },
  {
    sectionId: "seed-my3-section-skills",
    title: "Langages",
    description: "Python, SQL, TypeScript, Scala, Bash",
    sortOrder: 0, current: false, visible: true,
  },
  {
    sectionId: "seed-my3-section-skills",
    title: "Data Engineering",
    description: "Apache Spark, Databricks, dbt, Airflow, Kafka, BigQuery, PostgreSQL",
    sortOrder: 1, current: false, visible: true,
  },
  {
    sectionId: "seed-my3-section-skills",
    title: "ML & Analytics",
    description: "scikit-learn, PyTorch, pandas, Metabase, Power BI, Jupyter",
    sortOrder: 2, current: false, visible: true,
  },
  {
    sectionId: "seed-my3-section-skills",
    title: "Infrastructure",
    description: "Docker, Kubernetes, Terraform, GCP, AWS, GitHub Actions",
    sortOrder: 3, current: false, visible: true,
  },
  {
    sectionId: "seed-my3-section-projects",
    title: "py-etl-toolkit",
    description: "Framework Python open source pour construire des pipelines ETL déclaratifs. 800+ stars sur GitHub. Support Postgres, BigQuery, S3.",
    startDate: "2024-03-01",
    current: true,
    sortOrder: 0, visible: true,
  },
  {
    sectionId: "seed-my3-section-projects",
    title: "sql-optimizer",
    description: "Outil CLI d'analyse et d'optimisation de requêtes SQL. Détection automatique d'anti-patterns et suggestions d'index.",
    startDate: "2023-01-01",
    endDate: "2023-11-01",
    current: false,
    sortOrder: 1, visible: true,
  },
  {
    sectionId: "seed-my3-section-lang",
    title: "Français", subtitle: "Langue maternelle",
    sortOrder: 0, current: false, visible: true,
  },
  {
    sectionId: "seed-my3-section-lang",
    title: "Anglais", subtitle: "Bilingue (C2)",
    sortOrder: 1, current: false, visible: true,
  },
  {
    sectionId: "seed-my3-section-lang",
    title: "Allemand", subtitle: "Intermédiaire (B1)",
    sortOrder: 2, current: false, visible: true,
  },
  {
    sectionId: "seed-my3-section-vol",
    title: "Mentor",
    organization: "OpenClassrooms",
    startDate: "2022-09-01",
    current: true,
    description: "Mentorat d'étudiants en reconversion vers la data science. Sessions hebdomadaires de code review et accompagnement projet.",
    sortOrder: 0, visible: true,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function seedResumeForUser(
  userId: string,
  resumeId: string,
  resumeValues: typeof resumeData,
  sectionValues: SectionSeed[],
  entryValues: EntrySeed[],
  label: string,
) {
  // Clean up existing seed data
  const existing = await db.query.resume.findFirst({
    where: eq(resume.id, resumeId),
  });
  if (existing) {
    await db.delete(resume).where(eq(resume.id, resumeId));
    console.log(`  ✓ Cleaned up existing "${label}" resume`);
  }

  await db.insert(resume).values({ ...resumeValues, userId });
  console.log(`  ✓ Created resume "${resumeValues.title}" (${label})`);

  await db.insert(resumeSection).values(sectionValues);
  console.log(`  ✓ Created ${sectionValues.length} sections`);

  await db.insert(resumeEntry).values(entryValues);
  console.log(`  ✓ Created ${entryValues.length} entries`);
}

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function seed() {
  console.log("🌱 Seeding database...\n");

  // --- Demo user ---
  console.log("  [Demo user]");
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, DEMO_USER.email),
  });

  let demoUserId = DEMO_USER.id;

  if (existingUser) {
    console.log(`  ✓ User "${DEMO_USER.email}" already exists (${existingUser.id})`);
    demoUserId = existingUser.id;
  } else {
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

  await seedResumeForUser(
    demoUserId,
    RESUME_ID,
    resumeData,
    sections,
    entries,
    "demo",
  );

  // --- Your user ---
  console.log("\n  [Your account]");
  const myUser = await db.query.user.findFirst({
    where: eq(user.id, MY_USER_ID),
  });

  if (!myUser) {
    console.log(`  ⚠ User ${MY_USER_ID} not found — skipping`);
  } else {
    console.log(`  ✓ Found user "${myUser.name}" <${myUser.email}>`);

    await seedResumeForUser(
      MY_USER_ID,
      MY_RESUME_ID,
      {
        id: MY_RESUME_ID,
        userId: MY_USER_ID,
        title: "Développeur Full-Stack",
        slug: `developpeur-full-stack-${Date.now().toString(36)}`,
        summary:
          "Développeur passionné spécialisé en React, Next.js et TypeScript. J'aime concevoir des applications web performantes avec des architectures propres. Toujours à la recherche de nouveaux défis techniques.",
        status: "published" as const,
      },
      myResumeSections,
      myResumeEntries,
      "CV #1 — Full-Stack",
    );

    await seedResumeForUser(
      MY_USER_ID,
      MY_RESUME_ID_2,
      {
        id: MY_RESUME_ID_2,
        userId: MY_USER_ID,
        title: "UI/UX Designer & Front-End",
        slug: `ui-ux-designer-${Date.now().toString(36)}`,
        summary:
          "Designer d'interfaces et développeur front-end avec un oeil pour le détail. Je crée des expériences utilisateur élégantes et accessibles, du wireframe au pixel final. Passionné par les design systems et l'animation web.",
        status: "draft" as const,
      },
      myResume2Sections,
      myResume2Entries,
      "CV #2 — UI/UX Design",
    );

    await seedResumeForUser(
      MY_USER_ID,
      MY_RESUME_ID_3,
      {
        id: MY_RESUME_ID_3,
        userId: MY_USER_ID,
        title: "Data Engineer",
        slug: `data-engineer-${Date.now().toString(36)}`,
        summary:
          "Data engineer avec une solide expérience en pipelines de données à grande échelle, cloud infrastructure et analytics. Contributeur open source. Passionné par l'optimisation et l'automatisation des workflows data.",
        status: "published" as const,
      },
      myResume3Sections,
      myResume3Entries,
      "CV #3 — Data Engineer",
    );
  }

  console.log("\n✅ Seed complete!\n");
  console.log("  Demo sign in:");
  console.log(`    Email:    ${DEMO_USER.email}`);
  console.log(`    Password: Demo1234!\n`);
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => closeDb());
