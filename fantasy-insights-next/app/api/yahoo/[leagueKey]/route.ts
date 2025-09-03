import { NextResponse } from 'next/server';
import { fetchLeagueMeta } from '@/lib/yahoo';

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
    const meta = await fetchLeagueMeta(leagueKey);
    return NextResponse.json(meta, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (err) {
    console.error('GET /api/yahoo/[leagueKey] error:', err);
    return NextResponse.json({ error: 'Failed to fetch league meta' }, { status: 500 });
  }
}