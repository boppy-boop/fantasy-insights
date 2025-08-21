import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

type League = { id: string; name: string; season?: string };
type LeaguesOk = { leagues: League[] };
type NotAuthed = { error: "UNAUTHORIZED" };

export async function GET(): Promise<NextResponse<LeaguesOk | NotAuthed>> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Stub leagues for now (replace with real Yahoo fetch once auth flow is 100%)
  const leagues: League[] = [
    { id: "demo-123", name: "Rex Grossman Premier", season: "2025" },
    { id: "demo-456", name: "RG Roto Elite", season: "2025" },
  ];

  return NextResponse.json({ leagues });
}
