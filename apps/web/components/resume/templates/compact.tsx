import type { TemplateProps, Section, ContactInfo } from "./types";
import { datedSections, tagSections, formatDate } from "./types";
import { Md } from "./markdown";

function ContactLine({
  email,
  contact,
}: {
  email: string;
  contact?: ContactInfo;
}) {
  const items = [email];
  if (contact?.phone) items.push(contact.phone);
  if (contact?.website) items.push(contact.website);
  if (contact?.linkedin) items.push(contact.linkedin);
  if (contact?.github) items.push(contact.github);

  return (
    <p className="text-xs text-muted-foreground">
      {items.join("  ·  ")}
    </p>
  );
}

function TagSection({ section }: { section: Section }) {
  const visibleEntries = section.entries.filter((e) => e.visible);
  if (visibleEntries.length === 0) return null;

  return (
    <div>
      <h2
        className="mb-1 text-xs font-bold uppercase tracking-wider"
        style={{ color: "var(--resume-accent)" }}
      >
        {section.title}
      </h2>
      <p className="text-xs leading-relaxed">
        {visibleEntries
          .map(
            (e) =>
              e.title + (e.subtitle ? ` (${e.subtitle})` : ""),
          )
          .join("  ·  ")}
      </p>
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
    <div>
      <h2
        className="mb-1.5 border-b pb-0.5 text-xs font-bold uppercase tracking-wider"
        style={{
          color: "var(--resume-accent)",
          borderColor: "var(--resume-accent)",
        }}
      >
        {section.title}
      </h2>
      <div className="space-y-2">
        {visibleEntries.map((entry) => (
          <div key={entry.id}>
            <div className="flex items-baseline justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-semibold">{entry.title}</span>
                {entry.organization && (
                  <span className="text-xs text-muted-foreground">
                    {" "}— {entry.organization}
                  </span>
                )}
                {entry.location && (
                  <span className="text-xs text-muted-foreground">
                    , {entry.location}
                  </span>
                )}
              </div>
              {hasDates && (entry.startDate || entry.endDate) && (
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatDate(entry.startDate)}
                  {(entry.endDate || entry.current) && " – "}
                  {entry.current ? "Présent" : formatDate(entry.endDate)}
                </span>
              )}
            </div>
            {entry.subtitle && (
              <p className="text-xs text-muted-foreground">{entry.subtitle}</p>
            )}
            {entry.description && (
              <div className="[&_p]:mt-0.5 [&_p]:text-xs [&_ul]:mt-0.5 [&_ul]:text-xs [&_ol]:mt-0.5 [&_ol]:text-xs">
                <Md>{entry.description}</Md>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompactTemplate({ resume }: TemplateProps) {
  const visibleSections = resume.sections.filter((s) => s.visible);

  return (
    <div className="resume-preview mx-auto max-w-[210mm] space-y-3 bg-white px-6 py-5 text-[12px] leading-snug text-foreground print:p-0 print:shadow-none dark:bg-background">
      {/* Header — tight, single-line */}
      <div className="text-center">
        <h1 className="text-lg font-bold tracking-tight">
          {resume.user.name}
        </h1>
        <ContactLine email={resume.user.email} contact={resume.contact} />
      </div>

      {resume.summary && (
        <p className="text-xs leading-relaxed">{resume.summary}</p>
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
