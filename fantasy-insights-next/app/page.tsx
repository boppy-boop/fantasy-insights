// app/page.tsx
"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useMemo } from "react";

type Card = {
  href: string;
  title: string;
  blurb: string;
  badge?: string;
};

export default function HomePage() {
  const { data: session, status } = useSession();

  const firstName = useMemo(() => {
    const raw =
      (session?.user?.name && session.user.name.trim()) ||
      (session?.user?.email && session.user.email.split("@")[0]) ||
      "Manager";
    // simple first token
    const tok = raw.split(/\s+/)[0];
    // Capitalize first letter for nicer greeting if needed
    return tok.charAt(0).toUpperCase() + tok.slice(1);
  }, [session?.user?.name, session?.user?.email]);

  const cards: Card[] = [
    {
      href: "/fantasy?season=2025&week=preseason",
      title: "Current Year League (2025)",
      blurb:
        "Weekly dashboard with ESPN-style notes: Team of the Week, blowouts, upsets, power rankings & more.",
      badge: "Live",
    },
    {
      href: "/history",
      title: "History",
      blurb:
        "Season archives, previous years’ analytics, and narrative recaps powered by your Yahoo data.",
    },
    {
      href: "/records",
      title: "Championship Records & Leaderboard",
      blurb:
        "Top finishers across seasons plus fun league records: high scores, longest streaks, biggest blowouts.",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-red-400">Rex Grossman Championship S League</p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {status === "authenticated" ? (
                  <>
                    Welcome back, <span className="text-red-500">{firstName}</span>.
                  </>
                ) : (
                  <>Your Fantasy Insights Hub</>
                )}
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-300">
                Modern ESPN-style league site with AI-generated notes based on what’s actually happening in your league.
              </p>

              <div className="mt-5 flex items-center gap-3">
                {status === "authenticated" ? (
                  <>
                    <Link
                      href="/fantasy?season=2025&week=preseason"
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                    >
                      Open 2025 Dashboard
                    </Link>
                    <button
                      onClick={() => void signOut()}
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => void signIn()}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                    >
                      Sign in to personalize
                    </button>
                    <Link
                      href="/fantasy?season=2025&week=preseason"
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
                    >
                      Continue as guest
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Small quick link to Owners */}
            <div className="hidden sm:block">
              <Link
                href="/owners"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
              >
                Owners Hub
                <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300 ring-1 ring-white/10">
                  New
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3-option grid */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10 transition hover:shadow-zinc-900/40"
            >
              {/* ambient glow */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rotate-12 rounded-full bg-red-700/10 blur-2xl transition group-hover:bg-red-600/20" />
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{c.title}</h2>
                {c.badge && (
                  <span className="rounded-md bg-red-600/20 px-2 py-0.5 text-xs font-semibold text-red-300 ring-1 ring-red-700/40">
                    {c.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-300">{c.blurb}</p>
              <div className="mt-4 text-sm font-semibold text-red-400 group-hover:text-red-300">
                Open →
              </div>
            </Link>
          ))}
        </div>

        {/* flavor footer */}
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center text-sm text-zinc-400">
          Tip: After you sign in, the hero will greet you by first name and we’ll personalize notes with your team.
        </div>
      </section>
    </main>
  );
}
