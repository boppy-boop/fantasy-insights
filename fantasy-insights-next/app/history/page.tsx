// app/history/page.tsx
import { fetchSeasons, fetchLeaguesBySeason, fetchMatchups } from '@/lib/yahoo';
import { computeStrengthOfSchedule, type WeekData } from '@/lib/insights';

export const revalidate = 300;

export default async function HistoryPage() {
  // pick latest season + first league
  const seasons = await fetchSeasons();
  const latest = seasons[0];
  const leagues = await fetchLeaguesBySeason(latest);
  const league = leagues[0];

  // sample a few recent weeks (adjust to your league)
  const weeksToShow = [1, 2, 3, 4, 5];
  const weeks: WeekData[] = [];
  for (const w of weeksToShow) {
    const matchups = await fetchMatchups(league.leagueKey, w);
    weeks.push({ week: w, matchups });
  }

  const sos = computeStrengthOfSchedule(weeks);

  return (
    <main className="p-8 grid gap-6">
      <h1 className="text-2xl font-bold">
        Matchup History — {league.name} ({latest})
      </h1>

      {/* Strength of Schedule */}
      <section className="rounded-xl border border-zinc-800 p-4">
        <h2 className="text-lg mb-2">Strength of Schedule (sample)</h2>
        <div className="grid grid-cols-[3rem_1fr_8rem] gap-x-2 gap-y-1">
          <div className="font-semibold">#</div>
          <div className="font-semibold">Team</div>
          <div className="font-semibold text-right">Avg Opp PF</div>
          {sos.map((row) => (
            <Row key={row.teamKey} a={String(row.rank)} b={row.teamName} c={row.sos.toFixed(1)} />
          ))}
        </div>
      </section>

      {/* Weeks */}
      {weeks.map((w) => (
        <section key={w.week} className="rounded-xl border border-zinc-800 p-4">
          <h3 className="text-base mb-2">Week {w.week}</h3>
          <div className="grid gap-2">
            {w.matchups.map((m, i) => {
              const [a, b] = m.teams;
              return (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto_1fr] items-center py-1 border-t border-white/10 first:border-0"
                >
                  <span>{a.teamName} — {a.points.toFixed(1)}</span>
                  <span className="opacity-60">vs</span>
                  <span className="text-right">{b.teamName} — {b.points.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}

function Row({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <>
      <div>{a}</div>
      <div>{b}</div>
      <div className="text-right">{c}</div>
    </>
  );
}
