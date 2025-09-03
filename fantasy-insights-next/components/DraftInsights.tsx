// components/DraftInsights.tsx
// Server component: normalizes whatever shape your season2025-data exports
// and computes Top Steals / Biggest Overspends without using `any`.

type UnknownRecord = Record<string, unknown>;

type DraftRow = {
  manager: string;
  player: string;
  cost: number;
  value: number;
  surplus: number; // value - cost
  round?: number;
  position?: string;
};

function isNumberLike(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function isStringLike(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function pickFirst<T extends unknown>(obj: UnknownRecord, keys: string[], guard: (v: unknown) => v is T): T | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (guard(v)) return v;
  }
  return undefined;
}

/**
 * Accepts a wide variety of draft-pick shapes and normalizes into DraftRow[].
 * Supported keys (any one of each group): 
 * - manager: manager | owner | team | teamName
 * - player: player | name | playerName
 * - cost: cost | price | amount | bid
 * - value: value | estValue | projectedValue | proj | projection
 * - round: round | rnd | pickRound
 * - position: pos | position
 */
function normalizePicks(raw: unknown): DraftRow[] {
  if (!Array.isArray(raw)) return [];
  const out: DraftRow[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as UnknownRecord;

    const manager = pickFirst<string>(o, ["manager", "owner", "team", "teamName"], isStringLike) ?? "Unknown";
    const player = pickFirst<string>(o, ["player", "name", "playerName"], isStringLike) ?? "Unknown Player";
    const cost = pickFirst<number>(o, ["cost", "price", "amount", "bid"], isNumberLike) ?? 0;
    const value =
      pickFirst<number>(o, ["value", "estValue", "projectedValue", "proj", "projection"], isNumberLike) ?? 0;
    const round = pickFirst<number>(o, ["round", "rnd", "pickRound"], isNumberLike);
    const position = pickFirst<string>(o, ["pos", "position"], isStringLike);

    out.push({
      manager,
      player,
      cost,
      value,
      surplus: value - cost,
      round,
      position,
    });
  }

  return out;
}

function formatRow(r: DraftRow) {
  const meta: string[] = [];
  if (r.position) meta.push(r.position);
  if (typeof r.round === "number") meta.push(`R${r.round}`);
  return meta.length ? `• ${meta.join(" • ")}` : "";
}

export default function DraftInsights({ picks }: { picks: unknown }) {
  const rows = normalizePicks(picks);
  if (!rows.length) {
    return (
      <section className="rounded-xl border border-zinc-800 p-4">
        <h2 className="text-lg mb-1">Draft Insights</h2>
        <p className="text-zinc-400">No draft data found. Check your <code>lib/season2025-data.ts</code> export.</p>
      </section>
    );
  }

  const sortedBySurplus = [...rows].sort((a, b) => b.surplus - a.surplus);
  const sortedByOverspend = [...rows].sort((a, b) => a.surplus - b.surplus);

  const steals = sortedBySurplus.slice(0, 5);
  const overspends = sortedByOverspend.slice(0, 5);

  const totalSpend = rows.reduce((sum, r) => sum + r.cost, 0);
  const totalValue = rows.reduce((sum, r) => sum + r.value, 0);
  const leagueDelta = totalValue - totalSpend;

  return (
    <section className="rounded-xl border border-zinc-800 p-4">
      <h2 className="text-lg mb-2">Draft Insights</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-900/30 p-4">
          <div className="text-xs uppercase tracking-wider text-zinc-400">League Spend</div>
          <div className="text-2xl font-semibold">${totalSpend.toFixed(0)}</div>
        </div>
        <div className="rounded-lg border border-blue-900/30 p-4">
          <div className="text-xs uppercase tracking-wider text-zinc-400">League Value</div>
          <div className="text-2xl font-semibold">${totalValue.toFixed(0)}</div>
        </div>
        <div className="rounded-lg border border-amber-900/30 p-4">
          <div className="text-xs uppercase tracking-wider text-zinc-400">Delta (Value - Spend)</div>
          <div className={`text-2xl font-semibold ${leagueDelta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {leagueDelta >= 0 ? "+" : ""}
            ${leagueDelta.toFixed(0)}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Top Steals */}
        <div>
          <h3 className="text-base font-semibold mb-2">Top Steals</h3>
          <ul className="space-y-2">
            {steals.map((r, i) => (
              <li key={`steal-${i}`} className="flex items-start justify-between gap-3 border-t border-white/10 pt-2 first:border-0 first:pt-0">
                <div className="min-w-0">
                  <div className="font-medium">
                    {r.player} <span className="text-zinc-400">({r.manager})</span>
                  </div>
                  <div className="text-xs text-zinc-400">{formatRow(r)}</div>
                </div>
                <div className="text-emerald-300 whitespace-nowrap">
                  +${r.surplus.toFixed(1)} <span className="text-zinc-400 text-xs"> (Val {r.value.toFixed(1)} • Cost {r.cost.toFixed(1)})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Biggest Overspends */}
        <div>
          <h3 className="text-base font-semibold mb-2">Biggest Overspends</h3>
          <ul className="space-y-2">
            {overspends.map((r, i) => (
              <li key={`over-${i}`} className="flex items-start justify-between gap-3 border-t border-white/10 pt-2 first:border-0 first:pt-0">
                <div className="min-w-0">
                  <div className="font-medium">
                    {r.player} <span className="text-zinc-400">({r.manager})</span>
                  </div>
                  <div className="text-xs text-zinc-400">{formatRow(r)}</div>
                </div>
                <div className="text-rose-300 whitespace-nowrap">
                  {r.surplus >= 0 ? "+" : ""}{r.surplus.toFixed(1)}{" "}
                  <span className="text-zinc-400 text-xs"> (Val {r.value.toFixed(1)} • Cost {r.cost.toFixed(1)})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
