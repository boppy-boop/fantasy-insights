"use client";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

function OptionCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href} className="group block rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold tracking-tight text-neutral-900">{title}</h3>
        <div className="rounded-full border border-neutral-200 p-2 transition group-hover:translate-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-neutral-600"><path d="M13.293 4.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L17.586 12l-4.293-4.293a1 1 0 010-1.414z"/><path d="M3 12a1 1 0 011-1h14a1 1 0 110 2H4a1 1 0 01-1-1z"/></svg>
        </div>
      </div>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
    </Link>
  );
}

export default function Page() {
  const { data: session, status } = useSession();
  const firstName = (session?.user?.name || "").split(" ")[0] || undefined;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 p-8 text-white shadow-sm">
        <p className="text-xs uppercase tracking-widest text-neutral-300">Rex Grossman Memorial Championship Series</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {firstName ? (
            <>
              Welcome back, <span className="text-red-400">{firstName}</span>.
            </>
          ) : (
            <>Welcome to your Fantasy Insights Hub.</>
          )}
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-200">
          Sign in with Yahoo to pull live league data and generate storylines, power rankings, and matchup notes—styled like a modern ESPN dashboard.
        </p>
        {!firstName && (
          <button
            onClick={() => signIn("yahoo")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M19.5 6h-15a1.5 1.5 0 00-1.5 1.5v9A1.5 1.5 0 004.5 18h15a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0019.5 6zM6 8.25h12V9H6v-.75zM6 10.5h12v3H6v-3z" /></svg>
            Sign in with Yahoo
          </button>
        )}
      </section>

      {/* Options */}
      <section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <OptionCard
            title="Current Year League Information (2025 Season)"
            description="Live standings, matchups, power rankings, injury headlines, and AI-generated weekly notes."
            href="/fantasy"
          />
          <OptionCard
            title="History"
            description="Interactive dashboard of prior seasons with trends, draft hit rates, manager tendencies, and rivalry heat."
            href="/history"
          />
          <OptionCard
            title="Championship Records & Leaderboard"
            description="Hall of Fame, single-week records, longest win streaks, and podium finishes across iterations."
            href="/records"
          />
        </div>
      </section>
    </div>
  );
}