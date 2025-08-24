// app/api/yahoo/seasons/route.ts

export type SeasonsResponse = { seasons: string[] };

/**
 * Returns a recent range of seasons with 2025 guaranteed.
 */
export async function GET(): Promise<Response> {
  const current = 2025;
  const years: number[] = [];
  for (let y = current; y >= current - 10; y--) years.push(y);
  const payload: SeasonsResponse = { seasons: years.map(String) };
  return Response.json(payload, { status: 200 });
}
