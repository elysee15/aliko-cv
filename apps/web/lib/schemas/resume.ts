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

export const templateTypes = ["classic", "modern", "minimal"] as const;
export type TemplateType = (typeof templateTypes)[number];

export const templateLabels: Record<TemplateType, string> = {
  classic: "Classique",
  modern: "Moderne",
  minimal: "Minimaliste",
};

export const templateDescriptions: Record<TemplateType, string> = {
  classic: "En-tête centré, sections bordées — professionnel et lisible.",
  modern: "Mise en page avec accent coloré et typographie moderne.",
  minimal: "Épuré et aéré, laisse le contenu respirer.",
};

export const updateResumeSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne doit pas dépasser 200 caractères")
    .optional(),
  summary: z.string().max(2000).nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
  template: z.enum(templateTypes).optional(),
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
