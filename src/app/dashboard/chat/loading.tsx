export default function ChatLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex h-[600px] flex-col rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 h-5 w-28 animate-pulse rounded bg-muted" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-9 flex-1 animate-pulse rounded bg-muted" />
          <div className="h-9 w-14 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
