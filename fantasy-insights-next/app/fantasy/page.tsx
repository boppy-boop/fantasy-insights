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
import { computeWeeklyInsights } from '@/lib/insights';

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

  return (
    <main className="p-8 grid gap-6">
      <header className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold">Fantasy — {latest}</h1>
        <span className="text-zinc-400">{league?.name}</span>
      </header>

      {/* Weekly summary cards */}
      <WeeklyNotes insights={insights} />

      {/* Matchup list for this week (client component, reads API route or passed data) */}
      <section className="rounded-xl border border-zinc-800 p-4">
        <h2 className="text-lg mb-2">This Week — Week {currentWeek}</h2>
        {/* If your ThisWeek component expects to fetch from the API itself, pass only labels;
            if you refactored it to accept data, you can pass { standings, matchups } instead. */}
        <ThisWeek standings={standings} matchups={matchups} weekLabel={`W${currentWeek}`} />
      </section>
    </main>
  );
}
