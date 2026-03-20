import type { SectionType } from "@/lib/schemas/resume";

type Entry = {
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

type Section = {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  entries: Entry[];
};

type ResumeData = {
  title: string;
  summary: string | null;
  sections: Section[];
  user: { name: string; email: string };
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function DateRange({
  startDate,
  endDate,
  current,
}: {
  startDate: string | null;
  endDate: string | null;
  current: boolean;
}) {
  if (!startDate && !endDate) return null;
  return (
    <span className="text-sm text-muted-foreground">
      {formatDate(startDate)}
      {(endDate || current) && " — "}
      {current ? "Présent" : formatDate(endDate)}
    </span>
  );
}

const datedSections = new Set<SectionType>([
  "experience",
  "education",
  "projects",
  "certifications",
  "volunteering",
]);

function SectionBlock({ section }: { section: Section }) {
  const visibleEntries = section.entries.filter((e) => e.visible);
  if (visibleEntries.length === 0 && section.type !== "custom") return null;

  const hasDates = datedSections.has(section.type);

  return (
    <div className="space-y-3">
      <h2 className="border-b pb-1 text-sm font-semibold uppercase tracking-wider">
        {section.title}
      </h2>
      <div className="space-y-4">
        {visibleEntries.map((entry) => (
          <div key={entry.id} className="space-y-0.5">
            <div className="flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <span className="font-medium">{entry.title}</span>
                {entry.organization && (
                  <span className="text-muted-foreground">
                    {" "}
                    — {entry.organization}
                  </span>
                )}
              </div>
              {hasDates && (
                <DateRange
                  startDate={entry.startDate}
                  endDate={entry.endDate}
                  current={entry.current}
                />
              )}
            </div>
            {entry.subtitle && (
              <p className="text-sm text-muted-foreground">{entry.subtitle}</p>
            )}
            {entry.location && (
              <p className="text-xs text-muted-foreground">{entry.location}</p>
            )}
            {entry.description && (
              <p className="mt-1 text-sm whitespace-pre-line">
                {entry.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResumePreview({ resume }: { resume: ResumeData }) {
  const visibleSections = resume.sections.filter((s) => s.visible);

  return (
    <div className="resume-preview mx-auto max-w-[210mm] space-y-6 bg-white p-8 text-[13px] leading-relaxed text-foreground print:p-0 print:shadow-none dark:bg-background">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {resume.user.name}
        </h1>
        <p className="text-sm text-muted-foreground">{resume.user.email}</p>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="space-y-1">
          <h2 className="border-b pb-1 text-sm font-semibold uppercase tracking-wider">
            Profil
          </h2>
          <p className="text-sm">{resume.summary}</p>
        </div>
      )}

      {/* Sections */}
      {visibleSections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}

      {visibleSections.length === 0 && !resume.summary && (
        <p className="py-12 text-center text-muted-foreground">
          Ce CV est vide. Ajoutez des sections et des entrées depuis
          l&apos;éditeur.
        </p>
      )}
    </div>
  );
}
