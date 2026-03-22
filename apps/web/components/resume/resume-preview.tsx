import type { TemplateType, FontFamily } from "@/lib/schemas/resume";
import type { ResumeData } from "./templates/types";
import { fontFamilyMap, resumeFontVariables } from "@/lib/fonts";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { MinimalTemplate } from "./templates/minimal";
import { ExecutiveTemplate } from "./templates/executive";
import { CreativeTemplate } from "./templates/creative";
import { CompactTemplate } from "./templates/compact";

type Props = {
  resume: ResumeData;
  template?: TemplateType;
};

const templates: Record<TemplateType, React.ComponentType<{ resume: ResumeData }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  creative: CreativeTemplate,
  compact: CompactTemplate,
};

export function ResumePreview({ resume, template = "classic" }: Props) {
  const Template = templates[template];
  const accent = resume.accentColor ?? "#6366f1";
  const fontKey = (resume.fontFamily ?? "inter") as FontFamily;
  const fontStack = fontFamilyMap[fontKey] ?? fontFamilyMap.inter;

  return (
    <div
      className={resumeFontVariables}
      style={
        {
          "--resume-accent": accent,
          fontFamily: fontStack,
        } as React.CSSProperties
      }
    >
      <Template resume={resume} />
    </div>
  );
}
