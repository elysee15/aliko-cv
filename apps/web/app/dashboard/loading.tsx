function CardSkeleton() {
  return (
    <div className="rounded-none border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="size-4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-3 w-24 rounded bg-muted animate-pulse" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-24 rounded bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
