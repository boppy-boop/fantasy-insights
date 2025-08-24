// lib/insights.ts
import type { Matchup, TeamStanding } from "./yahoo";

export type WeeklyInsights = {
  teamOfWeek?: { teamName: string; score: number } | null;
  blowout?: { home: string; away: string; margin: number } | null;
  closest?: { home: string; away: string; margin: number } | null;
  upsets?: Array<{ winner: string; loser: string; winnerSeed: number; loserSeed: number; margin: number }>;
};

function seedMap(standings: TeamStanding[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const t of standings) {
    if (!t?.teamKey) continue;
    // Lower rank number = higher seed
    const seed = Number.isFinite(t.rank) && t.rank > 0 ? t.rank : 999;
    m[t.teamKey] = seed;
  }
  return m;
}

export function computeWeeklyInsights({
  matchups,
  standings,
}: {
  matchups: Matchup[];
  standings: TeamStanding[];
}): WeeklyInsights {
  const out: WeeklyInsights = { upsets: [] };

  if (!Array.isArray(matchups) || matchups.length === 0) {
    return out;
  }

  // Team of the Week (highest single-team score)
  let bestTeam: { teamName: string; score: number } | null = null;

  // Blowout / Closest
  let blowout: { home: string; away: string; margin: number } | null = null;
  let closest: { home: string; away: string; margin: number } | null = null;

  // Upsets (seeded by standings)
  const seeds = seedMap(standings);
  const upsets: Array<{ winner: string; loser: string; winnerSeed: number; loserSeed: number; margin: number }> = [];

  for (const m of matchups) {
    const home = m.home;
    const away = m.away;

    // Highest single-team score
    const pair: Array<{ teamName: string; score: number }> = [
      { teamName: home.teamName, score: Number(home.score || 0) },
      { teamName: away.teamName, score: Number(away.score || 0) },
    ];
    for (const t of pair) {
      if (!bestTeam || t.score > bestTeam.score) bestTeam = { teamName: t.teamName, score: t.score };
    }

    // Margins
    const margin = Math.abs(Number(home.score || 0) - Number(away.score || 0));
    if (!blowout || margin > blowout.margin) {
      blowout = { home: home.teamName, away: away.teamName, margin };
    }
    if (!closest || margin < closest.margin) {
      closest = { home: home.teamName, away: away.teamName, margin };
    }

    // Upset detection (lower seed number = better team)
    const homeSeed = seeds[home.teamKey] ?? 999;
    const awaySeed = seeds[away.teamKey] ?? 999;

    let winner = home;
    let loser = away;
    if (Number(away.score || 0) > Number(home.score || 0)) {
      winner = away;
      loser = home;
    }

    const winnerSeed = seeds[winner.teamKey] ?? 999;
    const loserSeed = seeds[loser.teamKey] ?? 999;

    // Upset if winner had a WORSE seed (higher number) than loser.
    // Require valid seeds (not 999) and a non-zero margin.
    if (winnerSeed !== 999 && loserSeed !== 999 && winnerSeed > loserSeed && margin > 0) {
      upsets.push({
        winner: winner.teamName,
        loser: loser.teamName,
        winnerSeed,
        loserSeed,
        margin,
      });
    }
  }

  out.teamOfWeek = bestTeam;
  out.blowout = blowout;
  out.closest = closest;
  out.upsets = upsets;

  return out;
}
