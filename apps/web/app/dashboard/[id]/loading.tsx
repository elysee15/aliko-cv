export default function EditorLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-md bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="rounded-xl border p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-20 w-full rounded-md bg-muted animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
