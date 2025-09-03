import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leagueKey: string }> }
) {
  const { leagueKey } = await params;

  if (!leagueKey) {
    return NextResponse.json({ error: 'Missing leagueKey' }, { status: 400 });
  }

  try {
    // TODO: Implement standings fetching logic
    return NextResponse.json({ message: 'Standings endpoint - implementation needed' }, { status: 200 });
  } catch (err) {
    console.error('GET /api/yahoo/standings/[leagueKey] error:', err);
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 });
  }
}