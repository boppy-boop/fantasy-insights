// app/api/yahoo/waivers/route.ts
import { NextRequest } from "next/server";

export interface WaiverMove {
  id: string;
  teamKey: string;
  playerName: string;
  type: "add" | "drop" | "add_drop" | "bid";
  amount?: number; // FAAB bid if applicable
  timestamp?: number;
}

export type WaiversResponse = { moves: WaiverMove[] };

/**
 * Returns recent waiver/transaction moves (typed, no `any`).
 * Placeholder returns an empty list; your UI guards for this.
 */
export async function GET(_req: NextRequest): Promise<Response> {
  const payload: WaiversResponse = { moves: [] };
  return Response.json(payload, { status: 200 });
}
