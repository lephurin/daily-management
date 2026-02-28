export default function NotesLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Editor skeleton */}
      <div className="rounded-lg border overflow-hidden">
        <div className="flex gap-2 bg-muted/60 border-b px-3 py-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-7 w-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
        <div className="space-y-3 p-4">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-48" />
        </div>
        <div className="flex justify-end border-t bg-muted/30 px-3 py-2">
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
