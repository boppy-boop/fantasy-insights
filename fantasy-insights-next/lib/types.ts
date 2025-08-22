// lib/types.ts
export type LeagueSummary = {
  leagueKey: string;
  name: string;
  season: string;
};

export type PlayerHeadshot = {
  name: string;
  image: string; // absolute URL
};

export type PowerRankingItem = {
  rank: number;
  team: string;
  analysis: string;
  likelihood: string;
  players?: PlayerHeadshot[];
};

export type StealOverpayItem = {
  player: string;
  cost: string;      // "$18"
  team: string;
  reason: string;
  image: string;     // absolute URL
};

export type StealsOverpays = {
  steals: StealOverpayItem[];
  overpays: StealOverpayItem[];
};

export type BiggestGame = {
  week: string;        // e.g. "Week 2"
  opponent: string;
  narrative: string;
};

export type StrengthOfScheduleItem = {
  team: string;
  grade: string;               // "A-", "B+" ...
  analysis: string;
  biggestGame?: BiggestGame;
};

export type WeekContent = {
  powerRankings: PowerRankingItem[];
  stealsOverpays: StealsOverpays;
  strengthOfSchedule: StrengthOfScheduleItem[];
};

export type Week = {
  id: string;          // "preseason", "week1" ..."week17"
  title: string;
  description: string;
  image?: string;
  content: WeekContent;
};
