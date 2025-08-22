// app/api/yahoo/waivers/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type WaiverMove = {
  player: string;
  position: string;
  image: string;
  addedByTeamKey: string;
  addedByTeamName: string;
  faab: number;
  tag: "steal" | "overpay" | "solid";
  blurb: string;
};

type WaiversResponse = {
  season: string;
  leagueKey: string;
  week: number;
  transactions: WaiverMove[];
};

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

const t = (idx1: number, leagueKey: string) => `${leagueKey}.t.${idx1}`;
const img = (espnId: string) => `https://a.espncdn.com/i/headshots/nfl/players/full/${espnId}.png`;

function movesForWeek(week: number, leagueKey: string): WaiverMove[] {
  if (week === 1) {
    return [
      {
        player: "Khalil Shakir",
        position: "WR",
        image: img("4430807"),
        addedByTeamKey: t(4, leagueKey),
        addedByTeamName: "#firebevell",
        faab: 3,
        tag: "steal",
        blurb:
          "Sneaks in for a single-digit bid after a spike in targets. Immediate WR3/FLEX with upside — textbook value.",
      },
      {
        player: "Chase Brown",
        position: "RB",
        image: img("4426508"),
        addedByTeamKey: t(3, leagueKey),
        addedByTeamName: "The Bengal King",
        faab: 2,
        tag: "steal",
        blurb:
          "Role uptick + goal-line look. Low-cost add that could snowball into weekly starter territory.",
      },
      {
        player: "Zach Ertz",
        position: "TE",
        image: img("15818"),
        addedByTeamKey: t(7, leagueKey),
        addedByTeamName: "No Rookies",
        faab: 1,
        tag: "steal",
        blurb:
          "TE wasteland special — routes + red zone usage for a $1 rental. That’s how you play the board.",
      },
      {
        player: "Joshua Kelley",
        position: "RB",
        image: img("4046694"),
        addedByTeamKey: t(10, leagueKey),
        addedByTeamName: "Wasted Money",
        faab: 28,
        tag: "overpay",
        blurb:
          "Premium FAAB for a timeshare back. Unless the role explodes, this burns budget you’ll want in November.",
      },
      {
        player: "Van Jefferson",
        position: "WR",
        image: img("4241467"),
        addedByTeamKey: t(6, leagueKey),
        addedByTeamName: "Pimp Named Slickback",
        faab: 22,
        tag: "overpay",
        blurb:
          "Chased last week’s usage at a WR4/5 profile price. Possible bye-week piece, but ROI looks thin.",
      },
    ];
  } else if (week === 2) {
    return [
      {
        player: "Roschon Johnson",
        position: "RB",
        image: img("4430737"),
        addedByTeamKey: t(5, leagueKey),
        addedByTeamName: "Stroud Control",
        faab: 6,
        tag: "steal",
        blurb:
          "Role growth + passing-down snaps. The kind of $6 swing that wins tight matchups later.",
      },
      {
        player: "KJ Osborn",
        position: "WR",
        image: img("4036133"),
        addedByTeamKey: t(2, leagueKey),
        addedByTeamName: "Scary Terry's Terror Squad",
        faab: 4,
        tag: "steal",
        blurb:
          "Snap share is sticky and the schedule softens. Depth add with weekly FLEX viability.",
      },
      {
        player: "Irv Smith Jr.",
        position: "TE",
        image: img("4240602"),
        addedByTeamKey: t(12, leagueKey),
        addedByTeamName: "The Jonathan Taylors",
        faab: 1,
        tag: "steal",
        blurb:
          "Red-zone routes ticked up — $1 dart that could solve a position headache.",
      },
      {
        player: "Marquez Valdes-Scantling",
        position: "WR",
        image: img("3128720"),
        addedByTeamKey: t(14, leagueKey),
        addedByTeamName: "D&B",
        faab: 26,
        tag: "overpay",
        blurb:
          "Boom-bust field stretcher for mid-20s FAAB. Weekly volatility makes this a tough hold.",
      },
    ];
  }
  return [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season") ?? "2025";
  const leagueKey = searchParams.get("leagueKey") ?? "nfl.l.777777";
  const weekParam = searchParams.get("week");
  const week = weekParam ? Number(weekParam) : 0;

  const payload: WaiversResponse = {
    season,
    leagueKey,
    week,
    transactions: movesForWeek(week, leagueKey),
  };
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
