import JSZip from "jszip";
import Papa from "papaparse";

import type { LinkedInData } from "./schema";

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
 * Strip empty leading lines and known metadata prefixes, then treat the
 * first line with at least two commas as the real header.
 */
const METADATA_PREFIXES = ["Notes:", "Created:", "Last Modified:"];

function cleanCSV(raw: string): string {
  const lines = raw.split("\n");
  const headerIdx = lines.findIndex((l) => {
    const trimmed = l.trim();
    if (trimmed === "") return false;
    if (METADATA_PREFIXES.some((p) => trimmed.startsWith(p))) return false;
    const commaCount = (trimmed.match(/,/g) ?? []).length;
    return commaCount >= 1;
  });
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
  const trimmed = value.trim();

  // "MM/YYYY" locale variant (e.g. "08/2020")
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const month = slashMatch[1]!.padStart(2, "0");
    return `${slashMatch[2]}-${month}-01`;
  }

  const parts = trimmed.split(/\s+/);
  // "Aug 2020"
  if (parts.length === 2) {
    const month = MONTHS[parts[0]!] ?? "01";
    return `${parts[1]}-${month}-01`;
  }
  // "2020"
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
        linkedinUrl:
          row["Public Profile Url"] ??
          row["profile_url"] ??
          row["Profile Url"] ??
          undefined,
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
