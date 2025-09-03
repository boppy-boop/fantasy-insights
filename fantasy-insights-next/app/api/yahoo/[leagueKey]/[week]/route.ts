import { NextResponse } from 'next/server';
import { fetchMatchups } from '@/lib/yahoo';

 export const runtime = 'nodejs'; // safer for Node libs / Yahoo SDK

type Params = { leagueKey: string; week: string };
// ✅ Most compatible with Next 15 type checker
export async function GET(
  _req: Request,
  context: { params: Promise<{ leagueKey: string; week: string }> }
) {
  const { leagueKey, week } = await context.params;

   if (!leagueKey) {
     return NextResponse.json({ error: 'Missing leagueKey' }, { status: 400 });
   }
   if (!week || !/^\d+$/.test(week)) {
     return NextResponse.json({ error: 'Invalid week' }, { status: 400 });
   }

   try {
     const data = await fetchMatchups(leagueKey, Number(week));

     return NextResponse.json(data, {
       status: 200,
       headers: {
         'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
       },
     });
   } catch (err) {
     console.error('GET /api/yahoo/[leagueKey]/[week] error:', err);
     return NextResponse.json(
       { error: 'Failed to fetch Yahoo matchups' },
       { status: 500 }
     );
   }
 }