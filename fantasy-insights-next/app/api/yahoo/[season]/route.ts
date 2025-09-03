// app/api/yahoo/[season]/route.ts
import { NextResponse } from 'next/server';
import { fetchLeaguesBySeason } from '@/lib/yahoo';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: any) {
  const { season } = await ctx.params;

  const n = Number(season);
  if (!Number.isFinite(n)) {
    return NextResponse.json({ error: 'Invalid season' }, { status: 400 });
  }

  try {
    const leagues = await fetchLeaguesBySeason(n);
    return NextResponse.json(leagues, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (err) {
    console.error('GET /api/yahoo/[season] error:', err);
    return NextResponse.json({ error: 'Failed to fetch leagues' }, { status: 500 });
  }
}
