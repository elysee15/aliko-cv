import type { TemplateProps, Section, ContactInfo } from "./types";
import { datedSections, tagSections, formatDate } from "./types";
import { Md } from "./markdown";

function SidebarContact({
  email,
  contact,
}: {
  email: string;
  contact?: ContactInfo;
}) {
  return (
    <div className="space-y-1.5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">
        Contact
      </h2>
      <div className="space-y-1 text-sm text-white/90">
        <p>{email}</p>
        {contact?.phone && <p>{contact.phone}</p>}
        {contact?.website && <p>{contact.website}</p>}
        {contact?.linkedin && <p>{contact.linkedin}</p>}
        {contact?.github && <p>{contact.github}</p>}
      </div>
    </div>
  );
}

function SidebarSection({ section }: { section: Section }) {
  const visibleEntries = section.entries.filter((e) => e.visible);
  if (visibleEntries.length === 0) return null;

  if (tagSections.has(section.type)) {
    return (
      <div className="space-y-1.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">
          {section.title}
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {visibleEntries.map((entry) => (
            <span
              key={entry.id}
              className="rounded-sm bg-white/15 px-2 py-0.5 text-xs text-white"
            >
              {entry.title}
              {entry.subtitle && (
                <span className="ml-1 opacity-70">({entry.subtitle})</span>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const hasDates = datedSections.has(section.type);

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">
        {section.title}
      </h2>
      <div className="space-y-2">
        {visibleEntries.map((entry) => (
          <div key={entry.id} className="space-y-0.5 text-sm text-white/90">
            <p className="font-medium text-white">{entry.title}</p>
            {entry.organization && (
              <p className="text-xs text-white/70">{entry.organization}</p>
            )}
            {hasDates && (entry.startDate || entry.endDate) && (
              <p className="text-xs text-white/60">
                {formatDate(entry.startDate)}
                {(entry.endDate || entry.current) && " — "}
                {entry.current ? "Présent" : formatDate(entry.endDate)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MainSection({ section }: { section: Section }) {
  const visibleEntries = section.entries.filter((e) => e.visible);
  if (visibleEntries.length === 0) return null;

  if (tagSections.has(section.type)) return null;

  const hasDates = datedSections.has(section.type);

  return (
    <div className="space-y-3">
      <h2
        className="border-b pb-1 text-sm font-bold uppercase tracking-wider"
        style={{ color: "var(--resume-accent)", borderColor: "var(--resume-accent)" }}
      >
        {section.title}
      </h2>
      <div className="space-y-4">
        {visibleEntries.map((entry) => (
          <div key={entry.id} className="space-y-0.5">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <span className="font-semibold">{entry.title}</span>
                {entry.organization && (
                  <span className="text-muted-foreground">
                    {" "}— {entry.organization}
                  </span>
                )}
              </div>
              {hasDates && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(entry.startDate)}
                  {(entry.endDate || entry.current) && " — "}
                  {entry.current ? "Présent" : formatDate(entry.endDate)}
                </span>
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

const sidebarTypes = new Set(["skills", "languages", "interests", "certifications"]);

export function ExecutiveTemplate({ resume }: TemplateProps) {
  const visibleSections = resume.sections.filter((s) => s.visible);
  const sidebarSections = visibleSections.filter((s) => sidebarTypes.has(s.type));
  const mainSections = visibleSections.filter((s) => !sidebarTypes.has(s.type));

  return (
    <div className="resume-preview mx-auto max-w-[210mm] bg-white text-[13px] leading-relaxed text-foreground print:shadow-none dark:bg-background">
      <div
        className="h-2 w-full"
        style={{ backgroundColor: "var(--resume-accent)" }}
      />

      <div className="flex min-h-[calc(297mm-8px)]">
        {/* Sidebar */}
        <div
          className="w-[220px] shrink-0 space-y-5 p-6"
          style={{ backgroundColor: "var(--resume-accent)" }}
        >
          <div className="space-y-1">
            <h1 className="text-xl font-bold leading-tight text-white">
              {resume.user.name}
            </h1>
            {resume.title && (
              <p className="text-sm font-medium text-white/70">{resume.title}</p>
            )}
          </div>

          <SidebarContact email={resume.user.email} contact={resume.contact} />

          {sidebarSections.map((section) => (
            <SidebarSection key={section.id} section={section} />
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 space-y-5 p-6">
          {resume.summary && (
            <div className="space-y-2">
              <h2
                className="border-b pb-1 text-sm font-bold uppercase tracking-wider"
                style={{ color: "var(--resume-accent)", borderColor: "var(--resume-accent)" }}
              >
                Profil
              </h2>
              <p className="text-sm">{resume.summary}</p>
            </div>
          )}

          {mainSections.map((section) => (
            <MainSection key={section.id} section={section} />
          ))}

          {mainSections.length === 0 && !resume.summary && (
            <p className="py-12 text-center text-muted-foreground">
              Ce CV est vide. Ajoutez des sections depuis l&apos;éditeur.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
