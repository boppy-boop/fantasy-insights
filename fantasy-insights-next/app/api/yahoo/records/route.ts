// app/api/yahoo/records/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = {
    champions: [
      {
        season: "2025",
        manager: "NBAngryWolfDan",
        teamName: "NBAngryWolfDan",
        record: "11-3",
        pointsFor: 1634.2,
        avatarUrl: "",
      },
      {
        season: "2024",
        manager: "Scary Terry",
        teamName: "Scary Terry's Terror Squad",
        record: "10-4",
        pointsFor: 1588.7,
        avatarUrl: "",
      },
      {
        season: "2023",
        manager: "#firebevell",
        teamName: "#firebevell",
        record: "10-4",
        pointsFor: 1553.0,
        avatarUrl: "",
      },
    ],
    leaderboard: [
      {
        manager: "NBAngryWolfDan",
        championships: 3,
        playoffAppearances: 6,
        winPct: 0.672,
        pointsForAvg: 116.7,
        avatarUrl: "",
      },
      {
        manager: "Scary Terry",
        championships: 2,
        playoffAppearances: 5,
        winPct: 0.641,
        pointsForAvg: 114.2,
        avatarUrl: "",
      },
      {
        manager: "#firebevell",
        championships: 1,
        playoffAppearances: 5,
        winPct: 0.622,
        pointsForAvg: 112.9,
        avatarUrl: "",
      },
    ],
    singleWeekHigh: {
      season: "2025",
      week: 10,
      manager: "NBAngryWolfDan",
      teamName: "NBAngryWolfDan",
      points: 149.3,
    },
    seasonPFRecord: {
      season: "2025",
      manager: "NBAngryWolfDan",
      teamName: "NBAngryWolfDan",
      points: 1634.2,
    },
    longestWinStreak: {
      type: "win",
      length: 6,
      manager: "#firebevell",
      teamName: "#firebevell",
      seasonStart: "2024",
      seasonEnd: "2024",
    },
    longestLossStreak: {
      type: "loss",
      length: 5,
      manager: "D&B",
      teamName: "D&B",
      seasonStart: "2023",
      seasonEnd: "2023",
    },
  };

  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
