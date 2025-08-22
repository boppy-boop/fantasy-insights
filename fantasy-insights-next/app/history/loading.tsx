export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-6 py-10 lg:px-8">
      <div className="h-6 w-40 rounded bg-zinc-800" />
      <div className="mt-3 h-10 w-3/5 rounded bg-zinc-800" />
      <div className="mt-8 h-24 w-full rounded-2xl bg-zinc-900" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 w-full rounded-2xl bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
