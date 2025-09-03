// app/api/yahoo/[leagueKey]/[week]/route.ts
import { NextResponse } from 'next/server';
import { fetchMatchups } from '@/lib/yahoo';

export const runtime = 'nodejs';

type _P = { leagueKey: string; week: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<_P> }
) {
  const { leagueKey, week } = await params;

  if (!leagueKey) {
    return NextResponse.json({ error: 'Missing leagueKey' }, { status: 400 });
  }
  if (!/^\d+$/.test(week)) {
    return NextResponse.json({ error: 'Invalid week' }, { status: 400 });
  }

  try {
    const data = await fetchMatchups(leagueKey, Number(week));
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (err) {
    console.error('GET /api/yahoo/[leagueKey]/[week] error:', err);
    return NextResponse.json({ error: 'Failed to fetch Yahoo matchups' }, { status: 500 });
  }
}
