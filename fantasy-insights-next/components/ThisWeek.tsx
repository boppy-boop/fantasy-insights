'use client';

import type { Matchup, TeamStanding } from '@/lib/yahoo';
import { computeWeeklyInsights, type WeeklyInsights } from '@/lib/insights';

type Props = {
  standings?: TeamStanding[];
  matchups?: Matchup[];
  loading?: boolean;
  error?: string | null;
  weekLabel?: string;
};

export default function ThisWeek({
  standings = [],
  matchups = [],
  loading = false,
  error = null,
  weekLabel = '',
}: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-sm uppercase tracking-wider text-zinc-400">Weekly Notes</h3>
        <p className="mt-2 text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-900/40 bg-red-900/10 p-6">
        <h3 className="text-sm uppercase tracking-wider text-red-400">Weekly Notes</h3>
        <p className="mt-2 text-red-300">{error}</p>
      </div>
    );
  }

  const insights: WeeklyInsights = computeWeeklyInsights(matchups ?? [], standings ?? []);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
      <h3 className="text-sm uppercase tracking-wider text-zinc-400">Weekly Notes {weekLabel ? `— ${weekLabel}` : ''}</h3>

      {/* Team of the Week */}
      <div className="rounded-lg border border-emerald-900/20 p-4">
        <div className="text-xs uppercase tracking-wider text-zinc-400">Team of the Week</div>
        {insights.teamOfWeek ? (
          <p className="mt-1">
            <span className="font-semibold text-white">{insights.teamOfWeek.team}</span>{' '}
            <span className="text-emerald-300">
              {insights.teamOfWeek.score.toFixed(1)}
            </span>
          </p>
        ) : (
          <p className="mt-1 text-zinc-400">No results yet.</p>
        )}
      </div>

      {/* Blowout */}
      <div className="rounded-lg border border-fuchsia-900/20 p-4">
        <div className="text-xs uppercase tracking-wider text-zinc-400">Blowout Meter</div>
        {insights.blowout ? (
          <p className="mt-1">
            <span className="text-white">{insights.blowout.home}</span> vs{' '}
            <span className="text-white">{insights.blowout.away}</span>
            <span className="text-fuchsia-300"> &nbsp; +{insights.blowout.margin.toFixed(1)}</span>
          </p>
        ) : (
          <p className="mt-1 text-zinc-400">No blowout yet.</p>
        )}
      </div>

      {/* Closest */}
      <div className="rounded-lg border border-blue-900/20 p-4">
        <div className="text-xs uppercase tracking-wider text-zinc-400">Photo Finish</div>
        {insights.closest ? (
          <p className="mt-1">
            <span className="text-white">{insights.closest.home}</span> vs{' '}
            <span className="text-white">{insights.closest.away}</span>
            <span className="text-blue-300"> &nbsp; Δ{insights.closest.margin.toFixed(1)}</span>
          </p>
        ) : (
          <p className="mt-1 text-zinc-400">No close game yet.</p>
        )}
      </div>

      {/* Upsets */}
      <div className="rounded-lg border border-amber-900/20 p-4">
        <div className="text-xs uppercase tracking-wider text-zinc-400">Upsets</div>
        {insights.upsets.length ? (
          <ul className="mt-1 space-y-1">
            {insights.upsets.map((u, i) => (
              <li key={i}>
                <span className="text-white">{u.winner}</span> over{' '}
                <span className="text-white">{u.loser}</span>
                <span className="text-amber-300"> &nbsp; (seed +{u.seedDiff}, +{u.margin.toFixed(1)})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-zinc-400">No upsets this week.</p>
        )}
      </div>
    </div>
  );
}
