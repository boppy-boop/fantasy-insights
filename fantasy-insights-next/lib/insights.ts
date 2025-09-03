// lib/insights.ts
import type { Matchup, TeamStanding } from '@/lib/yahoo';

/** Public types other files import */
export type WeekData = { week: number; matchups: Matchup[] };

export type LeaguePowerRanking = {
  teamKey: string;
  teamName: string;
  score: number; // higher better
  rank: number;
};

export type StrengthOfSchedule = {
  teamKey: string;
  teamName: string;
  sos: number; // higher = tougher opponents
  rank: number;
};

export type WeeklyInsights = {
  teamOfWeek: { team: string; score: number } | null;
  blowout: { home: string; away: string; margin: number } | null;
  closest: { home: string; away: string; margin: number } | null;
  upsets: Array<{ winner: string; loser: string; seedDiff: number; margin: number }>;
};

/** Helpers */
function margin(a: number, b: number): number {
  return Math.abs(a - b);
}
function avg(nums: number[]): number {
  return nums.length ? nums.reduce((x, y) => x + y, 0) / nums.length : 0;
}
export function teamNameFromStanding(s: TeamStanding | undefined): string {
  return s?.teamName ?? '';
}

/** Build a quick map of teamKey -> rank (1 = best) from standings */
function buildSeedMap(standings: TeamStanding[]): Map<string, number> {
  const map = new Map<string, number>();
  if (!Array.isArray(standings)) return map;

  // Prefer explicit rank; fallback to wins/PF if needed
  const sorted = [...standings].sort(
    (a, b) => (a.rank ?? 0) - (b.rank ?? 0) || (b.wins - a.wins) || (b.pointsFor - a.pointsFor)
  );
  sorted.forEach((t, idx) => {
    map.set(t.teamKey, t.rank || idx + 1);
  });
  return map;
}

/** Compute weekly insights from standardized Matchup shape (teams[0], teams[1]) */
export function computeWeeklyInsights(
  matchups: Matchup[],
  standings: TeamStanding[] = []
): WeeklyInsights {
  if (!Array.isArray(matchups) || matchups.length === 0) {
    return { teamOfWeek: null, blowout: null, closest: null, upsets: [] };
  }

  const seeds = buildSeedMap(standings);

  let teamOfWeek: { team: string; score: number } | null = null;
  let blowout: { home: string; away: string; margin: number } | null = null;
  let closest: { home: string; away: string; margin: number } | null = null;
  const upsets: WeeklyInsights['upsets'] = [];

  for (const m of matchups) {
    if (!m?.teams || m.teams.length < 2) continue;
    const [home, away] = m.teams;

    const homeName = home.teamName;
    const awayName = away.teamName;
    const homeScore = Number(home.points ?? 0);
    const awayScore = Number(away.points ?? 0);

    // Team of the week (highest single score)
    const localTop = homeScore >= awayScore
      ? { team: homeName, score: homeScore }
      : { team: awayName, score: awayScore };
    if (!teamOfWeek || localTop.score > teamOfWeek.score) {
      teamOfWeek = localTop;
    }

    // Blowout / Closest
    const diff = margin(homeScore, awayScore);
    if (!blowout || diff > blowout.margin) {
      blowout = homeScore >= awayScore
        ? { home: homeName, away: awayName, margin: diff }
        : { home: awayName, away: homeName, margin: diff };
    }
    if (!closest || diff < closest.margin) {
      closest = homeScore >= awayScore
        ? { home: homeName, away: awayName, margin: diff }
        : { home: awayName, away: homeName, margin: diff };
    }

    // Upset: winner has worse seed number (higher rank value) than loser
    const winner = homeScore >= awayScore ? home : away;
    const loser = homeScore >= awayScore ? away : home;
    const wSeed = seeds.get(winner.teamKey) ?? Number.MAX_SAFE_INTEGER;
    const lSeed = seeds.get(loser.teamKey) ?? Number.MIN_SAFE_INTEGER;
    const seedDiff = wSeed - lSeed;

    if (seedDiff > 0) {
      upsets.push({
        winner: winner.teamName,
        loser: loser.teamName,
        seedDiff,
        margin: diff,
      });
    }
  }

  upsets.sort((a, b) => b.seedDiff - a.seedDiff || b.margin - a.margin);

  return { teamOfWeek, blowout, closest, upsets };
}

/** Simple power rankings; `_allWeeks` kept for future weighting */
export function computePowerRankings(
  standings: TeamStanding[],
  _allWeeks?: WeekData[]
): LeaguePowerRanking[] {
  void _allWeeks; // silence unused param warning
  const rows = (standings ?? []).map((t) => {
    const score = t.wins * 2 + t.pointsFor / 100 + (t.pointsFor - t.pointsAgainst) / 50;
    return { teamKey: t.teamKey, teamName: t.teamName, score, rank: 0 };
  });
  rows.sort((a, b) => b.score - a.score);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

/** SOS = average opponent PF faced across given weeks */
export function computeStrengthOfSchedule(allWeeks: WeekData[]): StrengthOfSchedule[] {
  const oppPF: Record<string, { name: string; pfs: number[] }> = {};
  for (const w of allWeeks ?? []) {
    for (const m of w.matchups ?? []) {
      if (!m?.teams || m.teams.length < 2) continue;
      const [a, b] = m.teams;
      if (!oppPF[a.teamKey]) oppPF[a.teamKey] = { name: a.teamName, pfs: [] };
      if (!oppPF[b.teamKey]) oppPF[b.teamKey] = { name: b.teamName, pfs: [] };
      oppPF[a.teamKey].pfs.push(Number(b.points ?? 0));
      oppPF[b.teamKey].pfs.push(Number(a.points ?? 0));
    }
  }
  const rows = Object.entries(oppPF).map(([teamKey, v]) => ({
    teamKey,
    teamName: v.name,
    sos: avg(v.pfs),
    rank: 0,
  }));
  rows.sort((a, b) => b.sos - a.sos);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

/** Convenience */
export function flattenMatchups(weeks: WeekData[]): Matchup[] {
  return (weeks ?? []).flatMap((w) => w.matchups ?? []);
}
