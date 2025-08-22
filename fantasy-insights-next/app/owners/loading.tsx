export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-6 py-10 lg:px-8">
      <div className="h-6 w-48 rounded bg-zinc-800" />
      <div className="mt-3 h-10 w-3/5 rounded bg-zinc-800" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
