// app/api/yahoo/matchups/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Side = { teamKey: string; teamName: string; score: number };
type Matchup = { week: number; home: Side; away: Side; isPlayoffs?: boolean };
type MatchupsResponse = { season: string; leagueKey: string; matchups: Matchup[] };

const t = (n: number, leagueKey: string) => `${leagueKey}.t.${n}`;

const TEAMS = [
  "NBAngryWolfDan", // 1
  "Scary Terry's Terror Squad", // 2
  "The Bengal King", // 3
  "#firebevell", // 4
  "Stroud Control", // 5
  "Pimp Named Slickback", // 6
  "No Rookies", // 7
  "Dr. Tran", // 8
  "Edmonton End-Zone Elite", // 9
  "Wasted Money", // 10
  "Saquon Two Three Four", // 11
  "The Jonathan Taylors", // 12
  "BDB'z", // 13
  "D&B", // 14
];

// quick helper to build one matchup
function M(week: number, homeIdx1Based: number, awayIdx1Based: number, leagueKey: string, hs: number, as: number): Matchup {
  return {
    week,
    home: { teamKey: t(homeIdx1Based, leagueKey), teamName: TEAMS[homeIdx1Based - 1], score: hs },
    away: { teamKey: t(awayIdx1Based, leagueKey), teamName: TEAMS[awayIdx1Based - 1], score: as },
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season") ?? "2025";
  const leagueKey = searchParams.get("leagueKey") ?? "nfl.l.777777";
  const weekParam = searchParams.get("week");
  const week = weekParam ? Number(weekParam) : 0;

  // Preseason: no matchups
  if (week === 0) {
    const payload: MatchupsResponse = { season, leagueKey, matchups: [] };
    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  }

  // Week 1 sample slate (7 matchups for 14-team league)
  let matchups: Matchup[] = [];
  if (week === 1) {
    matchups = [
      M(1, 1, 14, leagueKey, 128.4, 91.7),
      M(1, 2, 13, leagueKey, 117.2, 98.9),
      M(1, 3, 12, leagueKey, 112.6, 121.3), // upset: #12 beats #3
      M(1, 4, 11, leagueKey, 109.8, 104.2),
      M(1, 5, 10, leagueKey, 125.1, 119.4),
      M(1, 6, 9, leagueKey, 101.7, 87.9),
      M(1, 7, 8, leagueKey, 94.5, 103.8), // upset: #8 beats #7
    ];
  } else if (week === 2) {
    // Another example week with a blowout
    matchups = [
      M(2, 1, 2, leagueKey, 149.3, 112.8), // high ToW candidate
      M(2, 3, 4, leagueKey, 118.1, 116.7),
      M(2, 5, 6, leagueKey, 99.2, 102.4),
      M(2, 7, 10, leagueKey, 87.6, 105.9),
      M(2, 8, 11, leagueKey, 110.4, 92.7),
      M(2, 9, 12, leagueKey, 120.2, 103.0),
      M(2, 13, 14, leagueKey, 79.5, 123.4), // blowout the other way
    ];
  } else {
    // Other weeks: leave empty (tile will say "No data for this week yet.")
    matchups = [];
  }

  const payload: MatchupsResponse = { season, leagueKey, matchups };
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
