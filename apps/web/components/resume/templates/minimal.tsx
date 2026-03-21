import type { TemplateProps, Section } from "./types";
import { datedSections, formatDate } from "./types";

function SectionBlock({ section }: { section: Section }) {
  const visibleEntries = section.entries.filter((e) => e.visible);
  if (visibleEntries.length === 0 && section.type !== "custom") return null;

  const hasDates = datedSections.has(section.type);

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {section.title}
      </h2>
      <div className="space-y-5">
        {visibleEntries.map((entry) => (
          <div key={entry.id} className="space-y-1">
            <div>
              <span className="font-medium">{entry.title}</span>
              {entry.organization && (
                <span className="text-muted-foreground">
                  {" "}— {entry.organization}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {hasDates && (entry.startDate || entry.endDate) && (
                <span>
                  {formatDate(entry.startDate)}
                  {(entry.endDate || entry.current) && " – "}
                  {entry.current ? "Présent" : formatDate(entry.endDate)}
                </span>
              )}
              {entry.location && <span>{entry.location}</span>}
            </div>
            {entry.subtitle && (
              <p className="text-sm text-muted-foreground">{entry.subtitle}</p>
            )}
            {entry.description && (
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {entry.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MinimalTemplate({ resume }: TemplateProps) {
  const visibleSections = resume.sections.filter((s) => s.visible);

  return (
    <div className="resume-preview mx-auto max-w-[210mm] space-y-8 bg-white px-10 py-10 text-[13px] leading-relaxed text-foreground print:p-0 print:shadow-none dark:bg-background">
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight">
          {resume.user.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
          <span>{resume.user.email}</span>
          {resume.contact?.phone && <span>{resume.contact.phone}</span>}
          {resume.contact?.website && <span>{resume.contact.website}</span>}
          {resume.contact?.linkedin && <span>{resume.contact.linkedin}</span>}
          {resume.contact?.github && <span>{resume.contact.github}</span>}
        </div>
      </div>

      {resume.summary && (
        <p className="border-l-2 border-muted-foreground/20 pl-4 text-sm leading-relaxed">
          {resume.summary}
        </p>
      )}

      {visibleSections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}

      {visibleSections.length === 0 && !resume.summary && (
        <p className="py-12 text-center text-muted-foreground">
          Ce CV est vide. Ajoutez des sections depuis l&apos;éditeur.
        </p>
      )}
    </div>
  );
}
