import type { LinkedInData } from "./schema";
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
        source: "import",
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
        source: "import" as const,
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
        source: "import",
      },
      entries: data.education.map((e, i) => ({
        title: e.degreeName || e.schoolName,
        organization: e.degreeName ? e.schoolName : undefined,
        startDate: e.startDate ?? undefined,
        endDate: e.endDate ?? undefined,
        current: false,
        description: [e.activities, e.notes].filter(Boolean).join("\n") || undefined,
        sortOrder: i,
        source: "import" as const,
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
        source: "import",
      },
      entries: data.skills.map((s, i) => ({
        title: s.name,
        sortOrder: i,
        source: "import" as const,
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
        source: "import",
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
        source: "import" as const,
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
        source: "import",
      },
      entries: data.languages.map((l, i) => ({
        title: l.name,
        subtitle: l.proficiency ?? undefined,
        sortOrder: i,
        source: "import" as const,
      })),
    });
  }

  return {
    summary: data.profile?.summary ?? data.profile?.headline,
    sections,
  };
}
