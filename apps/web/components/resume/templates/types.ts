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

export type ResumeData = {
  title: string;
  summary: string | null;
  sections: Section[];
  user: { name: string; email: string };
};

export type TemplateProps = {
  resume: ResumeData;
};

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
