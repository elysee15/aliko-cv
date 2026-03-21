import type { TemplateProps, Section } from "./types";
import { datedSections, formatDate } from "./types";

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
    <span className="text-xs font-medium text-primary/70">
      {formatDate(startDate)}
      {(endDate || current) && " – "}
      {current ? "Présent" : formatDate(endDate)}
    </span>
  );
}

function SectionBlock({ section }: { section: Section }) {
  const visibleEntries = section.entries.filter((e) => e.visible);
  if (visibleEntries.length === 0 && section.type !== "custom") return null;

  const hasDates = datedSections.has(section.type);

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
        <span className="inline-block h-0.5 w-4 rounded bg-primary" />
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

export function ModernTemplate({ resume }: TemplateProps) {
  const visibleSections = resume.sections.filter((s) => s.visible);

  return (
    <div className="resume-preview mx-auto max-w-[210mm] bg-white text-[13px] leading-relaxed text-foreground print:shadow-none dark:bg-background">
      <div className="bg-primary/5 px-8 py-6 dark:bg-primary/10">
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
