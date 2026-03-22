import type { TemplateType } from "@/lib/schemas/resume";

export const templateThumbnails: Record<TemplateType, React.ReactNode> = {
  classic: (
    <div className="flex h-full flex-col gap-1 p-1.5">
      <div className="mx-auto h-1.5 w-8 rounded-full bg-current opacity-70" />
      <div className="mx-auto h-0.5 w-6 rounded-full bg-current opacity-30" />
      <div className="mt-1 space-y-1">
        <div className="h-0.5 w-full rounded-full bg-current opacity-20" />
        <div className="h-2 w-full rounded-sm bg-current opacity-10" />
        <div className="h-0.5 w-full rounded-full bg-current opacity-20" />
        <div className="h-2 w-full rounded-sm bg-current opacity-10" />
      </div>
    </div>
  ),
  modern: (
    <div className="flex h-full flex-col">
      <div className="rounded-t-sm bg-current p-1.5 opacity-10">
        <div className="h-1.5 w-6 rounded-full bg-current opacity-60" />
        <div className="mt-0.5 h-0.5 w-4 rounded-full bg-current opacity-30" />
      </div>
      <div className="flex-1 space-y-1 p-1.5">
        <div className="flex items-center gap-1">
          <div className="h-0.5 w-1 rounded-full bg-current opacity-50" />
          <div className="h-0.5 w-4 rounded-full bg-current opacity-30" />
        </div>
        <div className="h-2 w-full rounded-sm bg-current opacity-10" />
        <div className="flex items-center gap-1">
          <div className="h-0.5 w-1 rounded-full bg-current opacity-50" />
          <div className="h-0.5 w-4 rounded-full bg-current opacity-30" />
        </div>
        <div className="h-2 w-full rounded-sm bg-current opacity-10" />
      </div>
    </div>
  ),
  minimal: (
    <div className="flex h-full flex-col gap-1 p-1.5">
      <div className="h-1.5 w-8 rounded-full bg-current opacity-40" />
      <div className="h-0.5 w-5 rounded-full bg-current opacity-20" />
      <div className="mt-1 border-l-2 border-current pl-1.5 opacity-20">
        <div className="h-1 w-full rounded-sm bg-current opacity-40" />
      </div>
      <div className="mt-1 space-y-1">
        <div className="h-0.5 w-3 rounded-full bg-current opacity-20" />
        <div className="h-1.5 w-full rounded-sm bg-current opacity-10" />
      </div>
    </div>
  ),
  executive: (
    <div className="flex h-full">
      <div className="w-1/3 space-y-1 rounded-l-sm bg-current p-1 opacity-15">
        <div className="h-1 w-full rounded-full bg-current opacity-50" />
        <div className="h-0.5 w-3/4 rounded-full bg-current opacity-30" />
        <div className="mt-1 h-0.5 w-full rounded-full bg-current opacity-30" />
        <div className="h-0.5 w-2/3 rounded-full bg-current opacity-30" />
      </div>
      <div className="flex-1 space-y-1 p-1.5">
        <div className="h-0.5 w-4 rounded-full bg-current opacity-30" />
        <div className="h-1.5 w-full rounded-sm bg-current opacity-10" />
        <div className="h-0.5 w-4 rounded-full bg-current opacity-30" />
        <div className="h-1.5 w-full rounded-sm bg-current opacity-10" />
      </div>
    </div>
  ),
  creative: (
    <div className="flex h-full flex-col">
      <div className="rounded-t-sm bg-linear-to-br from-current to-current/60 p-1.5">
        <div className="h-1.5 w-6 rounded-full bg-white opacity-80" />
        <div className="mt-0.5 h-0.5 w-4 rounded-full bg-white opacity-40" />
      </div>
      <div className="flex-1 space-y-1 p-1.5">
        <div className="rounded-sm border border-current/10 p-1">
          <div className="h-0.5 w-4 rounded-full bg-current opacity-30" />
          <div className="mt-0.5 h-1 w-full rounded-sm bg-current opacity-10" />
        </div>
        <div className="rounded-sm border border-current/10 p-1">
          <div className="h-0.5 w-3 rounded-full bg-current opacity-30" />
          <div className="mt-0.5 h-1 w-full rounded-sm bg-current opacity-10" />
        </div>
      </div>
    </div>
  ),
  compact: (
    <div className="flex h-full flex-col gap-0.5 p-1.5">
      <div className="mx-auto h-1 w-6 rounded-full bg-current opacity-50" />
      <div className="mx-auto h-0.5 w-8 rounded-full bg-current opacity-20" />
      <div className="mt-0.5 space-y-0.5">
        <div className="h-0.5 w-full rounded-full bg-current opacity-20" />
        <div className="h-1 w-full rounded-sm bg-current opacity-8" />
        <div className="h-0.5 w-full rounded-full bg-current opacity-20" />
        <div className="h-1 w-full rounded-sm bg-current opacity-8" />
        <div className="h-0.5 w-full rounded-full bg-current opacity-20" />
        <div className="h-1 w-full rounded-sm bg-current opacity-8" />
      </div>
    </div>
  ),
};
