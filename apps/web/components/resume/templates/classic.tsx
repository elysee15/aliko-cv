import type { TemplateProps, Section, ContactInfo } from "./types";
import { datedSections, tagSections, formatDate } from "./types";
import { Md } from "./markdown";

function ContactLine({ email, contact }: { email: string; contact?: ContactInfo }) {
  const items = [email];
  if (contact?.phone) items.push(contact.phone);
  if (contact?.website) items.push(contact.website);
  if (contact?.linkedin) items.push(contact.linkedin);
  if (contact?.github) items.push(contact.github);

  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mr-2">·</span>}
          {item}
        </span>
      ))}
    </p>
  );
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

function TagSection({ section }: { section: Section }) {
  const visibleEntries = section.entries.filter((e) => e.visible);
  if (visibleEntries.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2
        className="border-b pb-1 text-sm font-semibold uppercase tracking-wider"
        style={{ borderColor: "var(--resume-accent)" }}
      >
        {section.title}
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {visibleEntries.map((entry) => (
          <span
            key={entry.id}
            className="border px-2 py-0.5 text-xs"
          >
            {entry.title}
            {entry.subtitle && (
              <span className="ml-1 text-muted-foreground">({entry.subtitle})</span>
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
        className="border-b pb-1 text-sm font-semibold uppercase tracking-wider"
        style={{ borderColor: "var(--resume-accent)" }}
      >
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
                    {" "}— {entry.organization}
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
            {entry.description && <Md>{entry.description}</Md>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClassicTemplate({ resume }: TemplateProps) {
  const visibleSections = resume.sections.filter((s) => s.visible);

  return (
    <div className="resume-preview mx-auto max-w-[210mm] space-y-6 bg-white p-8 text-[13px] leading-relaxed text-foreground print:p-0 print:shadow-none dark:bg-background">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {resume.user.name}
        </h1>
        <ContactLine email={resume.user.email} contact={resume.contact} />
      </div>

      {resume.summary && (
        <div className="space-y-1">
          <h2
            className="border-b pb-1 text-sm font-semibold uppercase tracking-wider"
            style={{ borderColor: "var(--resume-accent)" }}
          >
            Profil
          </h2>
          <p className="text-sm">{resume.summary}</p>
        </div>
      )}

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
