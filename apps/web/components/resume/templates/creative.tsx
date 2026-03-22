import type { TemplateProps, Section, ContactInfo } from "./types";
import { datedSections, tagSections, formatDate } from "./types";
import { Md } from "./markdown";

function ContactBar({
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
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
      {items.map((item, i) => (
        <span key={i}>{item}</span>
      ))}
    </div>
  );
}

function TagSection({ section }: { section: Section }) {
  const visibleEntries = section.entries.filter((e) => e.visible);
  if (visibleEntries.length === 0) return null;

  return (
    <div className="rounded-lg border bg-background p-4 shadow-sm">
      <h2
        className="mb-3 text-sm font-bold uppercase tracking-wider"
        style={{ color: "var(--resume-accent)" }}
      >
        {section.title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {visibleEntries.map((entry) => (
          <span
            key={entry.id}
            className="rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: "var(--resume-accent)" }}
          >
            {entry.title}
            {entry.subtitle && (
              <span className="ml-1 font-normal opacity-80">
                ({entry.subtitle})
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: Section }) {
  const visibleEntries = section.entries.filter((e) => e.visible);
  if (visibleEntries.length === 0 && section.type !== "custom") return null;

  if (tagSections.has(section.type)) {
    return <TagSection section={section} />;
  }

  const hasDates = datedSections.has(section.type);

  return (
    <div className="rounded-lg border bg-background p-4 shadow-sm">
      <h2
        className="mb-3 text-sm font-bold uppercase tracking-wider"
        style={{ color: "var(--resume-accent)" }}
      >
        {section.title}
      </h2>
      <div className="space-y-4">
        {visibleEntries.map((entry) => (
          <div key={entry.id} className="space-y-0.5">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <span className="font-bold">{entry.title}</span>
                {entry.organization && (
                  <span className="ml-1 text-muted-foreground">
                    — {entry.organization}
                  </span>
                )}
              </div>
              {hasDates && (entry.startDate || entry.endDate) && (
                <span
                  className="shrink-0 text-xs font-semibold"
                  style={{ color: "var(--resume-accent)" }}
                >
                  {formatDate(entry.startDate)}
                  {(entry.endDate || entry.current) && " – "}
                  {entry.current ? "Présent" : formatDate(entry.endDate)}
                </span>
              )}
            </div>
            {entry.subtitle && (
              <p className="text-sm font-medium text-muted-foreground">
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

export function CreativeTemplate({ resume }: TemplateProps) {
  const visibleSections = resume.sections.filter((s) => s.visible);

  return (
    <div className="resume-preview mx-auto max-w-[210mm] bg-muted/30 text-[13px] leading-relaxed text-foreground print:bg-white print:shadow-none dark:bg-background">
      {/* Gradient header */}
      <div
        className="px-8 py-8"
        style={{
          background: `linear-gradient(135deg, var(--resume-accent), color-mix(in srgb, var(--resume-accent) 60%, black))`,
        }}
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          {resume.user.name}
        </h1>
        <div className="mt-2">
          <ContactBar email={resume.user.email} contact={resume.contact} />
        </div>
        {resume.summary && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85">
            {resume.summary}
          </p>
        )}
      </div>

      {/* Body — card grid */}
      <div className="space-y-4 px-6 py-6">
        {visibleSections.map((section) => (
          <SectionCard key={section.id} section={section} />
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
