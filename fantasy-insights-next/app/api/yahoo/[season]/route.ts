export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ season: string }> }
) {
  const { season } = await params;

  const n = Number(season);
}