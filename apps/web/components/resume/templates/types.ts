import type { SectionType } from "@/lib/schemas/resume";

export type Entry = {
  id: string;
  title: string;
  subtitle: string | null;
  organization: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string | null;
  visible: boolean;
};

export type Section = {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  entries: Entry[];
};

export type ContactInfo = {
  phone?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
};

export type ResumeData = {
  title: string;
  summary: string | null;
  sections: Section[];
  user: { name: string; email: string };
  contact?: ContactInfo;
  accentColor?: string;
  fontFamily?: string;
};

export type TemplateProps = {
  resume: ResumeData;
};

export const tagSections = new Set<SectionType>([
  "skills",
  "languages",
  "interests",
]);

export const datedSections = new Set<SectionType>([
  "experience",
  "education",
  "projects",
  "certifications",
  "volunteering",
]);

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

export function hasContactInfo(contact?: ContactInfo): boolean {
  if (!contact) return false;
  return !!(contact.phone || contact.website || contact.linkedin || contact.github);
}
