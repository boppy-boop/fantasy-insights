// app/page.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const session = await auth();
  const fullName = session?.user?.name || "";
  const firstName = fullName.split(" ")[0] || "Manager";

  const isAuthed = Boolean(session);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-900/40 via-zinc-900 to-zinc-950">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              {isAuthed ? `Welcome back, ${firstName}.` : "Rex Grossman Championship S League"}
            </h1>
            <p className="mt-4 text-zinc-300 text-lg max-w-2xl mx-auto">
              {isAuthed
                ? "Dive into your 2025 season hub, explore league history, and track records—styled like the modern ESPN you know."
                : "Sign in with Yahoo to unlock your fantasy league insights, history, and AI-generated storylines."}
            </p>

            {!isAuthed ? (
              <div className="mt-8 flex justify-center">
                <Link
                  href="/signin"
                  className="inline-flex items-center rounded-xl px-6 py-3 font-semibold
                             bg-purple-700 hover:bg-purple-600 transition-colors duration-200
                             shadow-lg shadow-purple-900/40"
                >
                  Sign in with Yahoo
                </Link>
              </div>
            ) : (
              <div className="mt-8 flex justify-center">
                <Link
                  href="/fantasy?season=2025"
                  className="inline-flex items-center rounded-xl px-6 py-3 font-semibold
                             bg-purple-700 hover:bg-purple-600 transition-colors duration-200
                             shadow-lg shadow-purple-900/40"
                >
                  Go to 2025 Season Hub
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tiles */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Current Year */}
          <Link
            href="/fantasy?season=2025"
            className="group rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6
                       hover:border-purple-700 hover:bg-zinc-900 transition-all duration-200
                       shadow-xl shadow-zinc-950/30 hover:shadow-purple-900/30"
          >
            <div className="text-sm text-purple-300 font-semibold">2025 Season</div>
            <h3 className="mt-2 text-2xl font-bold">Current Year League Information</h3>
            <p className="mt-2 text-zinc-400">
              Standings, matchups, waiver impact, and weekly AI notes.
            </p>
            <div className="mt-4 inline-flex items-center text-purple-300 group-hover:text-purple-200">
              Explore &rarr;
            </div>
          </Link>

          {/* 2. History */}
          <Link
            href="/fantasy?view=history"
            className="group rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6
                       hover:border-purple-700 hover:bg-zinc-900 transition-all duration-200
                       shadow-xl shadow-zinc-950/30 hover:shadow-purple-900/30"
          >
            <div className="text-sm text-purple-300 font-semibold">Multi-Season</div>
            <h3 className="mt-2 text-2xl font-bold">History</h3>
            <p className="mt-2 text-zinc-400">
              Dashboard of previous seasons with analytics, trends, and storylines.
            </p>
            <div className="mt-4 inline-flex items-center text-purple-300 group-hover:text-purple-200">
              Browse &rarr;
            </div>
          </Link>

          {/* 3. Championship Records & Leaderboard */}
          <Link
            href="/owners"
            className="group rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6
                       hover:border-purple-700 hover:bg-zinc-900 transition-all duration-200
                       shadow-xl shadow-zinc-950/30 hover:shadow-purple-900/30"
          >
            <div className="text-sm text-purple-300 font-semibold">All-Time</div>
            <h3 className="mt-2 text-2xl font-bold">Championship Records & Leaderboard</h3>
            <p className="mt-2 text-zinc-400">
              Top finishers across eras, records hall, and head-to-head bragging rights.
            </p>
            <div className="mt-4 inline-flex items-center text-purple-300 group-hover:text-purple-200">
              View leaderboard &rarr;
            </div>
          </Link>
        </div>

        {/* Hint for logged-out users */}
        {!isAuthed && (
          <p className="mt-6 text-sm text-zinc-500">
            Tip: You’ll need to{" "}
            <Link href="/signin" className="underline underline-offset-4 hover:text-zinc-300">
              sign in with Yahoo
            </Link>{" "}
            before these sections can show your league data.
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Rex Grossman Championship S League Insights — built for fun, styled like ESPN.
        </div>
      </footer>
    </main>
  );
}
