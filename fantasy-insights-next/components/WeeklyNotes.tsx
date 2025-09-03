'use client';

import type { WeeklyInsights } from '@/lib/insights';
import PlayerHeadshot from './PlayerHeadshot';

type Props = {
  insights?: WeeklyInsights | null;
  loading?: boolean;
  className?: string;
};

export default function WeeklyNotes({ insights, loading = false, className = '' }: Props) {
  return (
    <div className={`rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10 ${className}`}>
      <h3 className="mb-4 text-xl font-semibold text-white">Weekly Notes</h3>

      {/* Loading */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-zinc-800" />
          ))}
        </div>
      ) : null}

      {/* Empty */}
      {!loading && !insights ? (
        <p className="text-zinc-400">No notes yet.</p>
      ) : null}

      {/* Content */}
      {!loading && insights ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Team of the Week */}
          <div className="rounded-lg border border-emerald-900/20 bg-emerald-900/10 p-4">
            <div className="text-xs uppercase tracking-wider text-zinc-400">Team of the Week</div>
            {insights.teamOfWeek ? (
              <div className="mt-2 flex items-center gap-3">
                <PlayerHeadshot name={insights.teamOfWeek.team} size={40} />
                <div>
                  <div className="text-sm font-semibold text-white">{insights.teamOfWeek.team}</div>
                  <div className="text-emerald-300">{insights.teamOfWeek.score.toFixed(1)} pts</div>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-zinc-400">No winner yet.</p>
            )}
          </div>

          {/* Blowout */}
          <div className="rounded-lg border border-fuchsia-900/20 bg-fuchsia-900/10 p-4">
            <div className="text-xs uppercase tracking-wider text-zinc-400">Blowout</div>
            {insights.blowout ? (
              <p className="mt-2">
                <span className="text-white">{insights.blowout.home}</span> vs{' '}
                <span className="text-white">{insights.blowout.away}</span>{' '}
                <span className="text-fuchsia-300">(+{insights.blowout.margin.toFixed(1)})</span>
              </p>
            ) : (
              <p className="mt-1 text-zinc-400">No blowout yet.</p>
            )}
          </div>

          {/* Closest */}
          <div className="rounded-lg border border-blue-900/20 bg-blue-900/10 p-4">
            <div className="text-xs uppercase tracking-wider text-zinc-400">Closest</div>
            {insights.closest ? (
              <p className="mt-2">
                <span className="text-white">{insights.closest.home}</span> vs{' '}
                <span className="text-white">{insights.closest.away}</span>{' '}
                <span className="text-blue-300">Δ{insights.closest.margin.toFixed(1)}</span>
              </p>
            ) : (
              <p className="mt-1 text-zinc-400">No close game yet.</p>
            )}
          </div>
        </div>
      ) : null}

      {/* Upsets list (optional row) */}
      {!loading && insights && insights.upsets.length > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-900/20 bg-amber-900/10 p-4">
          <div className="text-xs uppercase tracking-wider text-zinc-400">Upsets</div>
          <ul className="mt-2 space-y-1">
            {insights.upsets.map((u, i) => (
              <li key={i} className="text-sm">
                <span className="text-white">{u.winner}</span> over{' '}
                <span className="text-white">{u.loser}</span>{' '}
                <span className="text-amber-300">(seed +{u.seedDiff}, +{u.margin.toFixed(1)})</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
