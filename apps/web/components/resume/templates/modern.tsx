import type { TemplateProps, Section } from "./types";
import { datedSections, tagSections, formatDate } from "./types";
import { Md } from "./markdown";

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
    <span
      className="text-xs font-medium"
      style={{ color: "color-mix(in srgb, var(--resume-accent) 70%, transparent)" }}
    >
      {formatDate(startDate)}
      {(endDate || current) && " – "}
      {current ? "Présent" : formatDate(endDate)}
    </span>
  );
}

function TagSection({ section }: { section: Section }) {
  const visibleEntries = section.entries.filter((e) => e.visible);
  if (visibleEntries.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
        style={{ color: "var(--resume-accent)" }}
      >
        <span
          className="inline-block h-0.5 w-4 rounded"
          style={{ backgroundColor: "var(--resume-accent)" }}
        />
        {section.title}
      </h2>
      <div className="flex flex-wrap gap-1.5 pl-6">
        {visibleEntries.map((entry) => (
          <span
            key={entry.id}
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: "color-mix(in srgb, var(--resume-accent) 10%, transparent)",
              color: "var(--resume-accent)",
            }}
          >
            {entry.title}
            {entry.subtitle && (
              <span className="ml-1 font-normal opacity-70">({entry.subtitle})</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionBlock({ section }: { section: Section }) {
  const visibleEntries = section.entries.filter((e) => e.visible);
  if (visibleEntries.length === 0 && section.type !== "custom") return null;

  if (tagSections.has(section.type)) {
    return <TagSection section={section} />;
  }

  const hasDates = datedSections.has(section.type);

  return (
    <div className="space-y-3">
      <h2
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
        style={{ color: "var(--resume-accent)" }}
      >
        <span
          className="inline-block h-0.5 w-4 rounded"
          style={{ backgroundColor: "var(--resume-accent)" }}
        />
        {section.title}
      </h2>
      <div className="space-y-4">
        {visibleEntries.map((entry) => (
          <div key={entry.id} className="space-y-0.5 pl-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="font-semibold">{entry.title}</span>
                {entry.organization && (
                  <span className="ml-1 text-muted-foreground">
                    @ {entry.organization}
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
              <p className="text-sm italic text-muted-foreground">
                {entry.subtitle}
              </p>
            )}
            {entry.location && (
              <p className="text-xs text-muted-foreground">{entry.location}</p>
            )}
            {entry.description && <Md>{entry.description}</Md>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModernTemplate({ resume }: TemplateProps) {
  const visibleSections = resume.sections.filter((s) => s.visible);

  return (
    <div className="resume-preview mx-auto max-w-[210mm] bg-white text-[13px] leading-relaxed text-foreground print:shadow-none dark:bg-background">
      <div
        className="px-8 py-6"
        style={{
          backgroundColor: "color-mix(in srgb, var(--resume-accent) 5%, transparent)",
        }}
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {resume.user.name}
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
          <span>{resume.user.email}</span>
          {resume.contact?.phone && (
            <span>· {resume.contact.phone}</span>
          )}
          {resume.contact?.website && (
            <span>· {resume.contact.website}</span>
          )}
          {resume.contact?.linkedin && (
            <span>· {resume.contact.linkedin}</span>
          )}
          {resume.contact?.github && (
            <span>· {resume.contact.github}</span>
          )}
        </div>
        {resume.summary && (
          <p className="mt-3 text-sm leading-relaxed">{resume.summary}</p>
        )}
      </div>

      <div className="space-y-6 px-8 py-6">
        {visibleSections.map((section) => (
          <SectionBlock key={section.id} section={section} />
        ))}

        {visibleSections.length === 0 && !resume.summary && (
          <p className="py-12 text-center text-muted-foreground">
            Ce CV est vide. Ajoutez des sections depuis l&apos;éditeur.
          </p>
        )}
      </div>
    </div>
  );
}
