// lib/insights.ts
import type { Matchup, TeamStanding } from "./yahoo";

export type WeeklyInsights = {
  teamOfWeek: { teamName: string; score: number } | null;
  blowout: { home: string; away: string; margin: number } | null;
  closest: { home: string; away: string; margin: number } | null;
  upsets: Array<{ winner: string; loser: string; seedDiff: number; margin: number }>;
};

// Helpers to read both legacy and new shapes safely
function getSideName(side: any): string {
  // supports { name } and { teamName }
  return (side?.name ?? side?.teamName ?? "") as string;
}
function getSideScore(side: any): number {
  return Number(side?.score ?? 0);
}

/**
 * Compute quick weekly insights from a list of matchups + (optional) standings.
 * Assumptions:
 * - Matchup side shape may be { name, score } OR { teamName, score }.
 * - Lower seed number is a better seed (1 is best). If no seed, we skip upset tagging.
 */
export function computeWeeklyInsights(
  matchups: Matchup[],
  standings: TeamStanding[]
): WeeklyInsights {
  if (!Array.isArray(matchups) || matchups.length === 0) {
    return { teamOfWeek: null, blowout: null, closest: null, upsets: [] };
  }

  // Seed map (team name -> seed) if available on standings
  const seedMap = new Map<string, number>();
  for (const s of standings ?? []) {
    // TeamStanding typically exposes { team: string; seed?: number } in our codebase;
    // accept some flexibility just in case.
    const name = (s as any).team ?? (s as any).teamName ?? "";
    const seed = (s as any).seed as number | undefined;
    if (name && typeof seed === "number") seedMap.set(name, seed);
  }

  let top: { teamName: string; score: number } | null = null;
  let blowout: { home: string; away: string; margin: number } | null = null;
  let closest: { home: string; away: string; margin: number } | null = null;
  const upsets: Array<{ winner: string; loser: string; seedDiff: number; margin: number }> = [];

  for (const m of matchups) {
    // tolerate both shapes on the matchup sides
    const home = getSideName((m as any).home);
    const away = getSideName((m as any).away);
    const hs = getSideScore((m as any).home);
    const as = getSideScore((m as any).away);

    // team of the week
    const localTop = hs >= as ? { teamName: home, score: hs } : { teamName: away, score: as };
    if (!top || localTop.score > top.score) top = localTop;

    // blowout (max margin)
    const margin = Math.abs(hs - as);
    if (!blowout || margin > blowout.margin) {
      blowout = { home, away, margin };
    }

    // closest (min margin)
    if (!closest || margin < closest.margin) {
      closest = { home, away, margin };
    }

    // upsets (only if both seeds exist and there isn't a tie)
    if (hs !== as) {
      const winner = hs > as ? home : away;
      const loser = hs > as ? away : home;

      if (seedMap.has(winner) && seedMap.has(loser)) {
        const wSeed = seedMap.get(winner)!;
        const lSeed = seedMap.get(loser)!;
        // "upset" = worse seed number (higher value) beats better seed (lower value)
        if (wSeed > lSeed) {
          upsets.push({ winner, loser, seedDiff: wSeed - lSeed, margin });
        }
      }
    }
  }

  // Sort upsets by biggest seed diff, then by margin
  upsets.sort((a, b) => (b.seedDiff - a.seedDiff) || (b.margin - a.margin));

  return {
    teamOfWeek: top,
    blowout,
    closest,
    upsets,
  };
}
