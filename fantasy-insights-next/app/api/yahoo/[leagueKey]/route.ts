// app/api/yahoo/[leagueKey]/route.ts
import { NextResponse } from 'next/server';
import { fetchLeagueMeta } from '@/lib/yahoo';

export const runtime = 'nodejs';

type P = { leagueKey: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<P> } // <- v15-friendly typing
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
      },
    });
  } catch (err) {
    console.error('GET /api/yahoo/[leagueKey] error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch league meta' },
      { status: 500 }
    );
  }
}
