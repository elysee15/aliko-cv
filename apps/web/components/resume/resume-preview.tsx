import type { TemplateType } from "@/lib/schemas/resume";
import type { ResumeData } from "./templates/types";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { MinimalTemplate } from "./templates/minimal";

type Props = {
  resume: ResumeData;
  template?: TemplateType;
};

const templates: Record<TemplateType, React.ComponentType<{ resume: ResumeData }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
};

export function ResumePreview({ resume, template = "classic" }: Props) {
  const Template = templates[template];
  return <Template resume={resume} />;
}
