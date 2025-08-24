// app/page.tsx
"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/**
 * Wrap the client landing in Suspense to satisfy Next.js's requirement
 * for useSearchParams in app router pages.
 */
export default function Page() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <LandingClient />
    </Suspense>
  );
}

function LandingClient() {
  // You may use this later for deep-links or debug flags; keeping it
  // here (inside Suspense) prevents the CSR bailout error.
  const searchParams = useSearchParams();
  void searchParams;

  // TODO: replace with real session-derived first name once next-auth is wired.
  // For now, keep it stable and friendly.
  const firstName = useMemo(() => "Manager", []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Hero */}
      <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-purple-950/40 via-zinc-900 to-indigo-950/40 p-8 shadow-2xl ring-1 ring-black/10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Welcome back, {firstName}! 🏈
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-300">
          Dive into your league’s live insights, history, and all-time records — presented with an
          ESPN-style polish and AI-ready commentary hooks.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/fantasy?tab=season-2025"
            className="rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/50 hover:bg-purple-600"
          >
            2025 Season Hub
          </Link>
          <Link
            href="/owners"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Owners & Teams
          </Link>
        </div>
      </section>

      {/* Three primary tiles */}
      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. 2025 Season */}
        <Link
          href="/fantasy?tab=season-2025"
          className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl ring-1 ring-black/10 transition hover:-translate-y-[2px] hover:bg-zinc-850 hover:shadow-2xl"
        >
          <div className="mb-3 text-xs uppercase tracking-wider text-purple-300">
            2025 Season
          </div>
          <h2 className="text-xl font-bold text-white group-hover:text-purple-200">
            Current Year League Information
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Preseason, Week 1–17 selector, live scoreboard, weekly notes, waiver steals &amp; overpays.
          </p>
        </Link>

        {/* 2. History */}
        <Link
          href="/fantasy?tab=history"
          className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl ring-1 ring-black/10 transition hover:-translate-y-[2px] hover:bg-zinc-850 hover:shadow-2xl"
        >
          <div className="mb-3 text-xs uppercase tracking-wider text-emerald-300">History</div>
          <h2 className="text-xl font-bold text-white group-hover:text-emerald-200">
            Past Seasons: Stats &amp; Analytics
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Pulls from Yahoo across all available league years; power rankings, matchup graphs, trends.
          </p>
        </Link>

        {/* 3. Records & Leaderboard */}
        <Link
          href="/fantasy?tab=records"
          className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl ring-1 ring-black/10 transition hover:-translate-y-[2px] hover:bg-zinc-850 hover:shadow-2xl"
        >
          <div className="mb-3 text-xs uppercase tracking-wider text-amber-300">
            Records &amp; Leaderboard
          </div>
          <h2 className="text-xl font-bold text-white group-hover:text-amber-200">
            Championships &amp; All-Time Marks
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Top finishers by season, longest win streaks, highest single-week scores, and more.
          </p>
        </Link>
      </section>
    </main>
  );
}

function LandingSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="h-40 animate-pulse rounded-3xl bg-zinc-800/80" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-800/60" />
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-800/60" />
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-800/60" />
      </div>
    </main>
  );
}
