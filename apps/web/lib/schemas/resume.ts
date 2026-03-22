import { z } from "zod";

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

export const createResumeSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne doit pas dépasser 200 caractères"),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;

export const templateTypes = [
  "classic",
  "modern",
  "minimal",
  "executive",
  "creative",
  "compact",
] as const;
export type TemplateType = (typeof templateTypes)[number];

export const templateLabels: Record<TemplateType, string> = {
  classic: "Classique",
  modern: "Moderne",
  minimal: "Minimaliste",
  executive: "Exécutif",
  creative: "Créatif",
  compact: "Compact",
};

export const templateDescriptions: Record<TemplateType, string> = {
  classic: "En-tête centré, sections bordées — professionnel et lisible.",
  modern: "Mise en page avec accent coloré et typographie moderne.",
  minimal: "Épuré et aéré, laisse le contenu respirer.",
  executive: "Deux colonnes avec barre latérale — idéal pour les cadres.",
  creative: "En-tête dégradé, sections en cartes — audacieux et unique.",
  compact: "Dense et optimisé ATS — maximum de contenu par page.",
};

export const accentColors = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#0ea5e9", label: "Bleu ciel" },
  { value: "#10b981", label: "Émeraude" },
  { value: "#f59e0b", label: "Ambre" },
  { value: "#ef4444", label: "Rouge" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Rose" },
  { value: "#64748b", label: "Ardoise" },
  { value: "#171717", label: "Noir" },
] as const;

export const fontFamilies = [
  { value: "inter", label: "Inter", description: "Sans-serif moderne" },
  { value: "merriweather", label: "Merriweather", description: "Serif élégant" },
  { value: "jetbrains-mono", label: "JetBrains Mono", description: "Monospace développeur" },
] as const;

export type FontFamily = (typeof fontFamilies)[number]["value"];

export const updateResumeSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne doit pas dépasser 200 caractères")
    .optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets")
    .optional(),
  summary: z.string().max(2000).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  website: z.string().max(200).nullable().optional(),
  linkedin: z.string().max(200).nullable().optional(),
  github: z.string().max(200).nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
  template: z.enum(templateTypes).optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur hexadécimale invalide")
    .optional(),
  fontFamily: z
    .enum(["inter", "merriweather", "jetbrains-mono"])
    .optional(),
});

export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export const sectionTypes = [
  "experience",
  "education",
  "skills",
  "languages",
  "projects",
  "certifications",
  "volunteering",
  "interests",
  "custom",
] as const;

export type SectionType = (typeof sectionTypes)[number];

export const sectionTypeLabels: Record<SectionType, string> = {
  experience: "Expérience",
  education: "Formation",
  skills: "Compétences",
  languages: "Langues",
  projects: "Projets",
  certifications: "Certifications",
  volunteering: "Bénévolat",
  interests: "Centres d'intérêt",
  custom: "Personnalisé",
};

export const createSectionSchema = z.object({
  resumeId: z.string().min(1),
  type: z.enum(sectionTypes),
  title: z.string().min(1, "Le titre est requis").max(200),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;

export const updateSectionSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  visible: z.boolean().optional(),
});

export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

export const createEntrySchema = z.object({
  sectionId: z.string().min(1),
  title: z.string().min(1, "Le titre est requis").max(200),
  subtitle: z.string().max(200).optional(),
  organization: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().max(5000).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;

export const updateEntrySchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200).optional(),
  subtitle: z.string().max(200).nullable().optional(),
  organization: z.string().max(200).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  current: z.boolean().optional(),
  description: z.string().max(5000).nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  visible: z.boolean().optional(),
});

export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
