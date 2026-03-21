import JSZip from "jszip";
import Papa from "papaparse";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LinkedInProfile = {
  firstName?: string;
  lastName?: string;
  headline?: string;
  summary?: string;
};

export type LinkedInPosition = {
  companyName: string;
  title: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
};

export type LinkedInEducation = {
  schoolName: string;
  degreeName?: string;
  notes?: string;
  activities?: string;
  startDate?: string;
  endDate?: string;
};

export type LinkedInSkill = {
  name: string;
};

export type LinkedInCertification = {
  name: string;
  authority?: string;
  licenseNumber?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
};

export type LinkedInLanguage = {
  name: string;
  proficiency?: string;
};

export type LinkedInData = {
  profile?: LinkedInProfile;
  positions: LinkedInPosition[];
  education: LinkedInEducation[];
  skills: LinkedInSkill[];
  certifications: LinkedInCertification[];
  languages: LinkedInLanguage[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseCSV<T extends Record<string, string>>(raw: string): T[] {
  const cleaned = cleanCSV(raw);
  const result = Papa.parse<T>(cleaned, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data;
}

/**
 * LinkedIn sometimes prepends metadata rows before the actual CSV header.
 * We detect the header row (first row with a comma) and strip everything above.
 */
function cleanCSV(raw: string): string {
  const lines = raw.split("\n");
  const headerIdx = lines.findIndex(
    (l) => l.includes(",") && !l.startsWith('"') && !l.startsWith("Note"),
  );
  if (headerIdx > 0) return lines.slice(headerIdx).join("\n");
  return raw;
}

/**
 * LinkedIn dates: "Aug 2020", "Jan 2019", or empty.
 * Converts to ISO date string "YYYY-MM-DD" (day defaults to 01).
 */
const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04",
  May: "05", Jun: "06", Jul: "07", Aug: "08",
  Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

function parseLinkedInDate(value?: string): string | undefined {
  if (!value || value.trim() === "") return undefined;
  const parts = value.trim().split(/\s+/);
  if (parts.length === 2) {
    const month = MONTHS[parts[0]!] ?? "01";
    return `${parts[1]}-${month}-01`;
  }
  if (parts.length === 1 && /^\d{4}$/.test(parts[0]!)) {
    return `${parts[0]}-01-01`;
  }
  return undefined;
}

function findFile(zip: JSZip, name: string): JSZip.JSZipObject | null {
  let match: JSZip.JSZipObject | null = null;
  zip.forEach((path, file) => {
    if (!file.dir && path.toLowerCase().endsWith(name.toLowerCase())) {
      match = file;
    }
  });
  return match;
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

export async function parseLinkedInZip(buffer: ArrayBuffer): Promise<LinkedInData> {
  const zip = await JSZip.loadAsync(buffer);

  const data: LinkedInData = {
    positions: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
  };

  // Profile
  const profileFile = findFile(zip, "Profile.csv");
  if (profileFile) {
    const raw = await profileFile.async("text");
    const rows = parseCSV<Record<string, string>>(raw);
    const row = rows[0];
    if (row) {
      data.profile = {
        firstName: row["First Name"] ?? row["first_name"],
        lastName: row["Last Name"] ?? row["last_name"],
        headline: row["Headline"] ?? row["headline"],
        summary: row["Summary"] ?? row["summary"],
      };
    }
  }

  // Positions
  const posFile = findFile(zip, "Positions.csv");
  if (posFile) {
    const raw = await posFile.async("text");
    const rows = parseCSV<Record<string, string>>(raw);
    data.positions = rows
      .filter((r) => r["Company Name"] || r["Title"])
      .map((r) => {
        const endDate = parseLinkedInDate(r["Finished On"]);
        return {
          companyName: r["Company Name"]?.trim() ?? "",
          title: r["Title"]?.trim() ?? "",
          description: r["Description"]?.trim() || undefined,
          location: r["Location"]?.trim() || undefined,
          startDate: parseLinkedInDate(r["Started On"]),
          endDate,
          current: !endDate,
        };
      });
  }

  // Education
  const eduFile = findFile(zip, "Education.csv");
  if (eduFile) {
    const raw = await eduFile.async("text");
    const rows = parseCSV<Record<string, string>>(raw);
    data.education = rows
      .filter((r) => r["School Name"])
      .map((r) => ({
        schoolName: r["School Name"]?.trim() ?? "",
        degreeName: r["Degree Name"]?.trim() || undefined,
        notes: r["Notes"]?.trim() || undefined,
        activities: r["Activities"]?.trim() || undefined,
        startDate: parseLinkedInDate(r["Start Date"]),
        endDate: parseLinkedInDate(r["End Date"]),
      }));
  }

  // Skills
  const skillsFile = findFile(zip, "Skills.csv");
  if (skillsFile) {
    const raw = await skillsFile.async("text");
    const rows = parseCSV<Record<string, string>>(raw);
    data.skills = rows
      .filter((r) => r["Name"])
      .map((r) => ({ name: r["Name"]!.trim() }));
  }

  // Certifications
  const certFile = findFile(zip, "Certifications.csv");
  if (certFile) {
    const raw = await certFile.async("text");
    const rows = parseCSV<Record<string, string>>(raw);
    data.certifications = rows
      .filter((r) => r["Name"])
      .map((r) => ({
        name: r["Name"]!.trim(),
        authority: r["Authority"]?.trim() || undefined,
        licenseNumber: r["License Number"]?.trim() || undefined,
        url: r["Url"]?.trim() || undefined,
        startDate: parseLinkedInDate(r["Started On"]),
        endDate: parseLinkedInDate(r["Finished On"]),
      }));
  }

  // Languages
  const langFile = findFile(zip, "Languages.csv");
  if (langFile) {
    const raw = await langFile.async("text");
    const rows = parseCSV<Record<string, string>>(raw);
    data.languages = rows
      .filter((r) => r["Name"])
      .map((r) => ({
        name: r["Name"]!.trim(),
        proficiency: r["Proficiency"]?.trim() || undefined,
      }));
  }

  return data;
}
