export const runtime = 'nodejs';

export async function GET(
  _req: Request, 
  { params }: { params: Promise<{ leagueKey: string }> }
) {
  const { leagueKey } = await params;

  if (!leagueKey) {
  }
}