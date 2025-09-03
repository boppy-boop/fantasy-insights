// app/fantasy/page.tsx
import {
  fetchSeasons,
  fetchLeaguesBySeason,
  fetchStandings,
  fetchMatchups,
  type YahooLeague,
  type TeamStanding,
  type Matchup,
} from '@/lib/yahoo';
import WeeklyNotes from '@/components/WeeklyNotes';
import ThisWeek from '@/components/ThisWeek';
import DraftInsights from '@/components/DraftInsights';
import { computeWeeklyInsights } from '@/lib/insights';

// Try to load your season 2025 draft data regardless of export style
async function loadDraftPicks(): Promise<unknown> {
  try {
    const mod = await import('@/lib/season2025');
    // Support named or default exports
    // e.g. export const draftPicks2025 = [...];  OR  export default [...]
    const cand =
      (mod as Record<string, unknown>)?.draftPicks2025 ??
      (mod as Record<string, unknown>)?.draftPicks ??
      (mod as Record<string, unknown>)?.default;
    return cand ?? [];
  } catch {
    return [];
  }
}

export const revalidate = 300; // ISR

export default async function FantasyPage() {
  // 1) Latest season + first league
  const seasons: number[] = await fetchSeasons();
  const latest: number = seasons[0];
  const leagues: YahooLeague[] = await fetchLeaguesBySeason(latest);
  const league = leagues[0];

  // 2) Pull standings + a single week of matchups (adjust `currentWeek` as needed)
  const standings: TeamStanding[] = await fetchStandings(league.leagueKey);
  const currentWeek = 1; // TODO: wire to real current week when available
  const matchups: Matchup[] = await fetchMatchups(league.leagueKey, currentWeek);

  // 3) Compute insights for WeeklyNotes / ThisWeek
  const insights = computeWeeklyInsights(matchups, standings);

  // 4) Load draft data for DraftInsights
  const draftPicks = await loadDraftPicks();

  return (
    <main className="p-8 grid gap-6">
      <header className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold">Fantasy — {latest}</h1>
        <span className="text-zinc-400">{league?.name}</span>
      </header>

      {/* Weekly summary cards */}
      <WeeklyNotes insights={insights} />

      {/* Draft Insights (restored “fun stuff”) */}
      <DraftInsights picks={draftPicks} />

      {/* Matchup list for this week */}
      <section className="rounded-xl border border-zinc-800 p-4">
        <h2 className="text-lg mb-2">This Week — Week {currentWeek}</h2>
        <ThisWeek standings={standings} matchups={matchups} weekLabel={`W${currentWeek}`} />
      </section>
    </main>
  );
}
