// app/records/page.tsx
import {
  fetchLeaguesBySeason,
  fetchSeasons,
  fetchStandings,
  fetchMatchups,
  type Matchup,
} from '@/lib/yahoo';
import { computePowerRankings, type WeekData } from '@/lib/insights';

export const revalidate = 300;

export default async function RecordsPage() {
  // latest season + first league
  const seasons = await fetchSeasons();
  const latest = seasons[0];
  const leagues = await fetchLeaguesBySeason(latest);
  const league = leagues[0];

  // standings
  const standings = await fetchStandings(league.leagueKey);

  // best record (win% then PF)
  const bestRecord = [...standings].sort((a, b) => {
    const gpA = a.wins + a.losses + a.ties || 1;
    const gpB = b.wins + b.losses + b.ties || 1;
    const wpA = (a.wins + 0.5 * a.ties) / gpA;
    const wpB = (b.wins + 0.5 * b.ties) / gpB;
    return wpB - wpA || b.pointsFor - a.pointsFor;
  })[0];

  // most points for
  const mostPF = [...standings].sort((a, b) => b.pointsFor - a.pointsFor)[0];

  // sample a few weeks for weekly high + power rankings context
  const weeksToCheck = [1, 2, 3, 4, 5];
  const allWeeks: WeekData[] = [];
  for (const w of weeksToCheck) {
    const matchups = await fetchMatchups(league.leagueKey, w);
    allWeeks.push({ week: w, matchups });
  }

  const weeklyHigh = findWeeklyHigh(allWeeks);
  const power = computePowerRankings(standings, allWeeks);

  return (
    <main style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
        League Records — {league.name} ({latest})
      </h1>

      {/* highlight cards */}
      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <Card
          title="Best Record"
          subtitle={bestRecord.teamName}
          value={`${bestRecord.wins}-${bestRecord.losses}-${bestRecord.ties}`}
          footer={`PF ${bestRecord.pointsFor.toFixed(1)} · PA ${bestRecord.pointsAgainst.toFixed(1)}`}
        />
        <Card
          title="Most Points For"
          subtitle={mostPF.teamName}
          value={mostPF.pointsFor.toFixed(1)}
          footer={`Record ${mostPF.wins}-${mostPF.losses}-${mostPF.ties}`}
        />
        <Card
          title="Weekly High (sample)"
          subtitle={`Week ${weeklyHigh.week} — ${weeklyHigh.teamName}`}
          value={weeklyHigh.points.toFixed(1)}
          footer={weeklyHigh.opponent ? `vs ${weeklyHigh.opponent}` : ''}
        />
      </section>

      {/* power rankings */}
      <section style={{ border: '1px solid #333', borderRadius: 12, padding: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Power Rankings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '3rem 1fr 6rem', rowGap: 6, columnGap: 8 }}>
          <HeaderCell>#</HeaderCell>
          <HeaderCell>Team</HeaderCell>
          <HeaderCell right>Score</HeaderCell>
          {power.map((p) => (
            <Row key={p.teamKey} left={String(p.rank)} middle={p.teamName} right={p.score.toFixed(2)} />
          ))}
        </div>
      </section>

      {/* standings table */}
      <section style={{ border: '1px solid #333', borderRadius: 12, padding: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Standings</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Team</Th>
              <Th>W</Th>
              <Th>L</Th>
              <Th>T</Th>
              <Th>PF</Th>
              <Th>PA</Th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t, i) => (
              <tr key={t.teamKey} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Td>{i + 1}</Td>
                <Td>{t.teamName}</Td>
                <Td>{t.wins}</Td>
                <Td>{t.losses}</Td>
                <Td>{t.ties}</Td>
                <Td>{t.pointsFor.toFixed(1)}</Td>
                <Td>{t.pointsAgainst.toFixed(1)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

/* ---------- helpers ---------- */

function findWeeklyHigh(weeks: { week: number; matchups: Matchup[] }[]) {
  let best = { teamName: '—', points: 0, week: 0, opponent: '' as string | undefined };
  for (const w of weeks) {
    for (const m of w.matchups) {
      if (!m.teams || m.teams.length < 2) continue;
      const [a, b] = m.teams;
      if (a.points > best.points) best = { teamName: a.teamName, points: a.points, week: w.week, opponent: b.teamName };
      if (b.points > best.points) best = { teamName: b.teamName, points: b.points, week: w.week, opponent: a.teamName };
    }
  }
  return best;
}

function Card(props: { title: string; subtitle: string; value: string | number; footer?: string }) {
  return (
    <div style={{ border: '1px solid #333', borderRadius: 12, padding: '1rem' }}>
      <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>{props.title}</div>
      <div style={{ fontSize: '1.05rem', marginTop: 4 }}>{props.subtitle}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: 8 }}>{props.value}</div>
      {props.footer ? <div style={{ marginTop: 6, opacity: 0.75 }}>{props.footer}</div> : null}
    </div>
  );
}
function Row({ left, middle, right }: { left: string; middle: string; right: string }) {
  return (
    <>
      <div>{left}</div>
      <div>{middle}</div>
      <div style={{ textAlign: 'right' }}>{right}</div>
    </>
  );
}
function HeaderCell({ children, right = false }: { children: React.ReactNode; right?: boolean }) {
  return <div style={{ fontWeight: 600, textAlign: right ? 'right' : 'left' }}>{children}</div>;
}
function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600 }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: '8px 6px' }}>{children}</td>;
}
