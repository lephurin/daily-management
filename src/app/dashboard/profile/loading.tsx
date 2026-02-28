export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-2 h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="mb-6 h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            </div>
          </div>
          {/* Fields */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-9 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
