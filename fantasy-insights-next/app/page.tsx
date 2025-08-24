// app/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const sp = useSearchParams();

  const firstName = useMemo(() => {
    const name = session?.user?.name || "";
    const first = name.trim().split(/\s+/)[0] || "";
    return first || "Manager";
  }, [session]);

  // optional: allow ?season= override in case you deep-link back here
  const season = useMemo(() => sp.get("season") ?? "2025", [sp]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-widest text-red-400">Welcome</p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {status === "authenticated" ? `Hey ${firstName},` : "Rex Grossman Championship S League"}
              </h1>
              <p className="mt-3 text-lg leading-7 text-zinc-300">
                Your modern, ESPN-styled fantasy hub — live insights, multi-season history,
                and a running hall of fame.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {status === "authenticated" ? (
                  <button
                    onClick={() => signOut()}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 hover:bg-zinc-700"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    onClick={() => signIn("yahoo")}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500"
                  >
                    Sign in with Yahoo
                  </button>
                )}
              </div>
            </div>

            <div className="hidden md:block">
              {/* simple decorative football shape */}
              <div className="relative h-32 w-56 rotate-12">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-800 to-red-600 shadow-2xl ring-1 ring-white/10" />
                <div className="absolute left-1/2 top-1/2 h-24 w-1 -translate-x-1/2 -translate-y-1/2 rounded bg-white/70 shadow" />
                <div className="absolute left-1/2 top-1/2 h-1 w-28 -translate-x-1/2 -translate-y-1/2 rounded bg-white/70 shadow" />
                <div className="absolute left-1/2 top-[46%] h-1 w-24 -translate-x-1/2 rounded bg-white/70 shadow" />
                <div className="absolute left-1/2 top-[54%] h-1 w-24 -translate-x-1/2 rounded bg-white/70 shadow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Actions */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* 1. Current Year */}
          <Link
            href={`/fantasy?season=${encodeURIComponent(season)}`}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:border-red-600 hover:bg-zinc-850"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-600/10 blur-2xl transition group-hover:bg-red-600/20" />
            <p className="text-xs font-semibold uppercase tracking-wider text-red-400">2025 Season</p>
            <h2 className="mt-1 text-xl font-bold text-white">Current Year League Information</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Live weekly insights, standings, and matchups. Preseason shows your curated draft analysis.
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-wide text-zinc-500">Open dashboard →</p>
          </Link>

          {/* 2. History */}
          <Link
            href="/history"
            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:border-red-600 hover:bg-zinc-850"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-600/10 blur-2xl transition group-hover:bg-red-600/20" />
            <p className="text-xs font-semibold uppercase tracking-wider text-red-400">Archive</p>
            <h2 className="mt-1 text-xl font-bold text-white">History</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Browse all seasons Yahoo returns for your account and jump into any league’s dashboard.
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-wide text-zinc-500">Explore seasons →</p>
          </Link>

          {/* 3. Records / Leaderboard */}
          <Link
            href="/records"
            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:border-red-600 hover:bg-zinc-850"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-600/10 blur-2xl transition group-hover:bg-red-600/20" />
            <p className="text-xs font-semibold uppercase tracking-wider text-red-400">Hall of Fame</p>
            <h2 className="mt-1 text-xl font-bold text-white">Championship Records & Leaderboard</h2>
            <p className="mt-2 text-sm text-zinc-300">
              All-time champions, top finishes, and fun records. (We’ll wire this to Yahoo data next.)
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-wide text-zinc-500">View leaderboard →</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
