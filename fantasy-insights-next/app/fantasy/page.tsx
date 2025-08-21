"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import AuthButton from "../../components/AuthButton";

type League = { id: string; name: string; season?: string };
type LeaguesOK = { leagues: League[] };

export default function FantasyPage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadLeagues(): Promise<void> {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/yahoo/leagues", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Leagues request failed (${res.status}): ${text}`);
      }
      const json = (await res.json()) as LeaguesOK;
      if (!json || !Array.isArray(json.leagues)) {
        throw new Error("Unexpected leagues response shape.");
      }
      setLeagues(json.leagues);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unknown error while loading leagues."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-zinc-300 hover:text-white">
            ← Home
          </Link>
          <div className="font-semibold">
            Rex Grossman Memorial Championship Series
          </div>
          <AuthButton />
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-2xl md:text-3xl font-bold">League Insights</h2>
        <p className="mt-2 text-zinc-400">
          Load your Yahoo leagues and jump into analytics.
        </p>

        {status !== "authenticated" ? (
          <div className="mt-8">
            <button
              onClick={() => signIn("yahoo")}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-500"
            >
              Sign in with Yahoo
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={loadLeagues}
                disabled={loading}
                className="rounded-xl bg-violet-600 px-4 py-2 text-white shadow hover:bg-violet-500 disabled:opacity-60"
              >
                {loading ? "Loading…" : "Load Yahoo Leagues"}
              </button>

              {/* Debug viewer (uses Link to satisfy lint) */}
              <Link
                href="/api/auth/session"
                target="_blank"
                className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-300 hover:bg-zinc-800"
              >
                View session JSON
              </Link>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-700 bg-red-950/40 p-4 text-red-200">
                {error}
              </div>
            )}

            <div className="mt-8 grid gap-4">
              {leagues.length === 0 && !loading && !error && (
                <div className="text-zinc-400">No leagues loaded yet.</div>
              )}
              {leagues.map((lg) => (
                <div
                  key={lg.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 hover:border-violet-600/50"
                >
                  <div className="text-lg font-semibold">{lg.name}</div>
                  <div className="text-zinc-400 text-sm">
                    Season: {lg.season ?? "—"} &middot; ID: {lg.id}
                  </div>
                  <div className="mt-3">
                    <Link
                      href={`/fantasy/league/${encodeURIComponent(lg.id)}`}
                      className="text-violet-300 hover:text-violet-200"
                    >
                      Open analytics →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
