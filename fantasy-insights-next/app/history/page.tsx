export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">League History</h1>
      <p className="text-sm text-neutral-600">Season-by-season dashboard with trends, draft ROI, rivalry heat, and playoff runs.</p>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight">Win % by Season</h2>
          <p className="mt-2 text-sm text-neutral-600">Plug charts here (e.g., Recharts) once data endpoints are wired.</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight">Draft Hit Rate</h2>
          <p className="mt-2 text-sm text-neutral-600">Show how often early picks finish top-5 at position, by manager.</p>
        </div>
      </div>
    </div>
  );
}