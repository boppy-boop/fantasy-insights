export type Team = { id: string; name: string; pf: number; pa: number; streak: number };


export function generateHeadlines(teams: Team[]): string[] {
// Simple example rules; replace with real data + LLM if desired
const sorted = [...teams].sort((a, b) => b.pf - a.pf);
const top = sorted.slice(0, 3).map(t => t.name).join(", ");
const heaters = teams.filter(t => t.streak >= 3).map(t => t.name).join(", ");
const ice = teams.filter(t => t.streak <= -3).map(t => t.name).join(", ");
const out: string[] = [];
if (top) out.push(`Power surge from ${top}.`);
if (heaters) out.push(`Heaters: ${heaters} riding multi-game streaks.`);
if (ice) out.push(`Time to thaw: ${ice} need a bounce-back week.`);
return out.length ? out : ["Awaiting enough data to generate trends."];
}