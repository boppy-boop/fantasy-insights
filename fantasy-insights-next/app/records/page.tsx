export default function RecordsPage() {
return (
<div className="space-y-6">
<h1 className="text-2xl font-extrabold tracking-tight">Championship Records & Leaderboard</h1>
<p className="text-sm text-neutral-600">Podium finishes, single-week highs, win streaks, comeback wins, and career points.</p>


<div className="grid gap-6 lg:grid-cols-3">
<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-2">
<h2 className="text-lg font-bold tracking-tight">All-Time Leaderboard</h2>
<table className="mt-3 w-full text-left text-sm">
<thead className="text-xs uppercase text-neutral-500">
<tr>
<th className="py-2">Manager</th>
<th className="py-2">Titles</th>
<th className="py-2">Finals</th>
<th className="py-2">Win %</th>
<th className="py-2">Career Pts</th>
</tr>
</thead>
<tbody className="divide-y">
{/* Map real data here */}
<tr>
<td className="py-2 font-medium">Placeholder GM</td>
<td className="py-2">2</td>
<td className="py-2">3</td>
<td className="py-2">.612</td>
<td className="py-2">18,234</td>
</tr>
</tbody>
</table>
</div>
<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
<h2 className="text-lg font-bold tracking-tight">Records</h2>
<ul className="mt-3 space-y-2 text-sm">
<li><span className="font-semibold">Single-week high:</span> 232.16 pts (Team X, 2024 Wk 7)</li>
<li><span className="font-semibold">Longest win streak:</span> 8 (Manager Y, 2023)</li>
<li><span className="font-semibold">Biggest upset:</span> 45.6-pt proj diff (2022)</li>
</ul>
</div>
</div>
</div>
);
}