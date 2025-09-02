// lib/insights.ts
import type { Matchup, TeamStanding } from "./yahoo";

export type WeeklyInsights = {
  teamOfWeek: { teamName: string; score: number } | null;
  blowout: { home: string; away: string; margin: number } | null;
  closest: { home: string; away: string; margin: number } | null;
  upsets: Array<{ winner: string; loser: string; seedDiff: number; margin: number }>;
};

function margin(a: number, b: number): number {
  return Math.abs(a - b);
}

function teamNameFromStanding(s: TeamStanding | undefined): string {
  return s?.team?.name ?? "";
}

function buildSeedMap(standings: TeamStanding[]): Map<string, number> {
  // Lower number = better seed
  const sorted = [...standings].sort((a, b) => {
    const aGames = a.wins + a.losses + a.ties;
    const bGames = b.wins + b.losses + b.ties;
    const aPct = aGames > 0 ? (a.wins + 0.5 * a.ties) / aGames : 0;
    const bPct = bGames > 0 ? (b.wins + 0.5 * b.ties) / bGames : 0;
    if (bPct !== aPct) return bPct - aPct;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });
  const map = new Map<string, number>();
  sorted.forEach((s, idx) => {
    map.set(s.team.name, idx + 1);
  });
  return map;
}

export function computeWeeklyInsights(matchups: Matchup[], standings: TeamStanding[]): WeeklyInsights {
  if (!Array.isArray(matchups) || matchups.length === 0) {
    return { teamOfWeek: null, blowout: null, closest: null, upsets: [] };
  }

  const seeds = buildSeedMap(Array.isArray(standings) ? standings : []);

  let teamOfWeek: { teamName: string; score: number } | null = null;
  let blowout: { home: string; away: string; margin: number } | null = null;
  let closest: { home: string; away: string; margin: number } | null = null;
  const upsets: Array<{ winner: string; loser: string; seedDiff: number; margin: number }> = [];

  for (const m of matchups) {
    const homeName = m.home.team.name;
    const awayName = m.away.team.name;
    const homeScore = m.home.score;
    const awayScore = m.away.score;

    // Team of the week
    const localTop =
      homeScore >= awayScore
        ? { teamName: homeName, score: homeScore }
        : { teamName: awayName, score: awayScore };
    if (!teamOfWeek || localTop.score > teamOfWeek.score) teamOfWeek = localTop;

    // Blowout / closest
    const diff = margin(homeScore, awayScore);
    if (!blowout || diff > blowout.margin) {
      blowout = { home: homeName, away: awayName, margin: diff };
    }
    if (!closest || diff < closest.margin) {
      closest = { home: homeName, away: awayName, margin: diff };
    }

    // Upsets (only if both seeds exist). Lower seed number = better seed.
    const homeSeed = seeds.get(homeName);
    const awaySeed = seeds.get(awayName);
    if (typeof homeSeed === "number" && typeof awaySeed === "number") {
      const winner = homeScore > awayScore ? homeName : awayName;
      const loser = winner === homeName ? awayName : homeName;
      const winnerSeed = winner === homeName ? homeSeed : awaySeed;
      const loserSeed = winner === homeName ? awaySeed : homeSeed;
      if (winnerSeed > loserSeed) {
        upsets.push({ winner, loser, seedDiff: winnerSeed - loserSeed, margin: diff });
      }
    }
  }

  // Sort upsets by biggest seed diff, then by margin
  upsets.sort((a, b) => (b.seedDiff - a.seedDiff) || (b.margin - a.margin));

  return { teamOfWeek, blowout, closest, upsets };
}
