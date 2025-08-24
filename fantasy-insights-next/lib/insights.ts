// lib/insights.ts
import type { Matchup, TeamStanding } from "./yahoo";

/**
 * What the UI consumes for the "Weekly Notes" tiles.
 */
export type WeeklyInsights = {
  /** Highest single-team score across all matchups */
  teamOfWeek: { teamName: string; score: number } | null;
  /** Largest winning margin (absolute) across all matchups */
  blowout: { home: string; away: string; margin: number } | null;
  /** Smallest winning margin (absolute) across all matchups */
  closest: { home: string; away: string; margin: number } | null;
};

/**
 * Compute weekly insights (team of the week, blowout, closest game)
 * from the given matchups. Standings are accepted for future tiebreakers,
 * but are not required for the current calculations.
 */
export function computeWeeklyInsights(
  matchups: Matchup[],
  standings: TeamStanding[]
): WeeklyInsights {
  // not used today; kept for future seed/tiebreak logic
  void standings;

  if (!Array.isArray(matchups) || matchups.length === 0) {
    return { teamOfWeek: null, blowout: null, closest: null };
  }

  let topTeam: { teamName: string; score: number } | null = null;
  let blowout: { home: string; away: string; margin: number } | null = null;
  let closest: { home: string; away: string; margin: number } | null = null;

  for (let i = 0; i < matchups.length; i++) {
    const m = matchups[i];

    const homeScore = safeNumber(m.home?.score);
    const awayScore = safeNumber(m.away?.score);

    // Team of the Week candidate (check both sides)
    const localTop =
      homeScore >= awayScore
        ? { teamName: m.home.teamName, score: homeScore }
        : { teamName: m.away.teamName, score: awayScore };

    if (!topTeam || localTop.score > topTeam.score) {
      topTeam = localTop;
    }

    // Margin calculations
    const diff = Math.abs(homeScore - awayScore);
    const marginPayload = {
      home: m.home.teamName,
      away: m.away.teamName,
      margin: round1(diff),
    };

    // Blowout: max margin
    if (!blowout || diff > blowout.margin) {
      blowout = marginPayload;
    }

    // Closest: min margin
    if (!closest || diff < closest.margin) {
      closest = marginPayload;
    }
  }

  return {
    teamOfWeek: topTeam,
    blowout,
    closest,
  };
}

/* ------------------------ helpers ------------------------ */

function safeNumber(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
