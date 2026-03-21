import type { LinkedInData } from "./parser";
import type {
  CreateSectionParams,
  CreateEntryParams,
} from "@aliko-cv/db/queries";

type SectionWithEntries = {
  section: Omit<CreateSectionParams, "resumeId">;
  entries: Omit<CreateEntryParams, "sectionId">[];
};

/**
 * Converts parsed LinkedIn data into a list of sections (with entries)
 * ready to be persisted to the database.
 */
export function linkedInToSections(data: LinkedInData): {
  summary?: string;
  sections: SectionWithEntries[];
} {
  const sections: SectionWithEntries[] = [];
  let order = 0;

  // Experience
  if (data.positions.length > 0) {
    sections.push({
      section: {
        type: "experience",
        title: "Expérience",
        sortOrder: order++,
      },
      entries: data.positions.map((p, i) => ({
        title: p.title,
        organization: p.companyName,
        location: p.location ?? undefined,
        startDate: p.startDate ?? undefined,
        endDate: p.endDate ?? undefined,
        current: p.current,
        description: p.description ?? undefined,
        sortOrder: i,
      })),
    });
  }

  // Education
  if (data.education.length > 0) {
    sections.push({
      section: {
        type: "education",
        title: "Formation",
        sortOrder: order++,
      },
      entries: data.education.map((e, i) => ({
        title: e.degreeName || e.schoolName,
        organization: e.degreeName ? e.schoolName : undefined,
        startDate: e.startDate ?? undefined,
        endDate: e.endDate ?? undefined,
        current: false,
        description: [e.activities, e.notes].filter(Boolean).join("\n") || undefined,
        sortOrder: i,
      })),
    });
  }

  // Skills
  if (data.skills.length > 0) {
    sections.push({
      section: {
        type: "skills",
        title: "Compétences",
        sortOrder: order++,
      },
      entries: data.skills.map((s, i) => ({
        title: s.name,
        sortOrder: i,
      })),
    });
  }

  // Certifications
  if (data.certifications.length > 0) {
    sections.push({
      section: {
        type: "certifications",
        title: "Certifications",
        sortOrder: order++,
      },
      entries: data.certifications.map((c, i) => ({
        title: c.name,
        organization: c.authority ?? undefined,
        subtitle: c.licenseNumber ?? undefined,
        startDate: c.startDate ?? undefined,
        endDate: c.endDate ?? undefined,
        current: false,
        description: c.url ?? undefined,
        sortOrder: i,
      })),
    });
  }

  // Languages
  if (data.languages.length > 0) {
    sections.push({
      section: {
        type: "languages",
        title: "Langues",
        sortOrder: order++,
      },
      entries: data.languages.map((l, i) => ({
        title: l.name,
        subtitle: l.proficiency ?? undefined,
        sortOrder: i,
      })),
    });
  }

  return {
    summary: data.profile?.summary ?? data.profile?.headline,
    sections,
  };
}
