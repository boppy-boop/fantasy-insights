export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-6 py-10 lg:px-8">
      <div className="h-6 w-40 rounded bg-zinc-800" />
      <div className="mt-3 h-10 w-3/5 rounded bg-zinc-800" />
      <div className="mt-8 flex gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-8 w-12 rounded-lg bg-zinc-800" />
        ))}
      </div>
      <div className="mt-8 h-6 w-64 rounded bg-zinc-800" />
      <div className="mt-3 h-4 w-4/5 rounded bg-zinc-900" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 w-full rounded-2xl bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
