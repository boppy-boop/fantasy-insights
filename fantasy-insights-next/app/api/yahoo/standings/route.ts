// app/api/yahoo/standings/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type TeamStanding = {
  teamKey: string;
  teamName: string;
  manager: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  streak?: string;
  rank: number; // 1 = best seed
};

type StandingsResponse = {
  season: string;
  leagueKey: string;
  standings: TeamStanding[];
};

// Helper to build a consistent teamKey
const key = (i: number, leagueKey: string) => `${leagueKey}.t.${i}`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season") ?? "2025";
  const leagueKey = searchParams.get("leagueKey") ?? "nfl.l.777777";

  // Seeded order roughly matches your preseason power rankings
  const names: Array<{ team: string; manager: string }> = [
    { team: "NBAngryWolfDan", manager: "NBAngryWolfDan" },
    { team: "Scary Terry's Terror Squad", manager: "Scary Terry" },
    { team: "The Bengal King", manager: "The Bengal King" },
    { team: "#firebevell", manager: "#firebevell" },
    { team: "Stroud Control", manager: "Stroud Control" },
    { team: "Pimp Named Slickback", manager: "Pimp Named Slickback" },
    { team: "No Rookies", manager: "No Rookies" },
    { team: "Dr. Tran", manager: "Dr. Tran" },
    { team: "Edmonton End-Zone Elite", manager: "Edmonton End-Zone Elite" },
    { team: "Wasted Money", manager: "Wasted Money" },
    { team: "Saquon Two Three Four", manager: "Saquon Two Three Four" },
    { team: "The Jonathan Taylors", manager: "The Jonathan Taylors" },
    { team: "BDB'z", manager: "BDB'z" },
    { team: "D&B", manager: "D&B" },
  ];

  // Lightly varied records/points so helpers have something to work with
  const basePF = 112.0;
  const basePA = 110.0;

  const standings: TeamStanding[] = names.map((n, idx) => {
    const rank = idx + 1; // 1..14
    const wins = Math.max(0, 10 - Math.floor(idx / 2)); // 10,10,9,9,8,8,7,7,6,6,5,5,4,4-ish
    const losses = 14 - wins - (idx % 3 === 0 ? 0 : 0); // simple fake record
    const ties = 0;
    const pf = basePF + (14 - rank) * 2.3; // better seeds → slightly higher PF
    const pa = basePA - (14 - rank) * 1.4;

    return {
      teamKey: key(rank, leagueKey),
      teamName: n.team,
      manager: n.manager,
      wins,
      losses,
      ties,
      pointsFor: Number(pf.toFixed(1)),
      pointsAgainst: Number(pa.toFixed(1)),
      streak: rank <= 4 ? `W${(rank % 3) + 1}` : `L${(rank % 2) + 1}`,
      rank,
    };
  });

  const payload: StandingsResponse = {
    season,
    leagueKey,
    standings,
  };

  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
