"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import AuthButton from "../components/AuthButton";

type League = {
  id: string;
  name: string;
  season?: string;
};

type LeaguesOk = { leagues: League[] };

export default function FantasyPage(): JSX.Element {
  const { status } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadLeagues = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/yahoo/leagues", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Leagues request failed (${res.status}): ${body || res.statusText}`);
      }

      const json = (await res.json()) as LeaguesOk;

      if (!json || !Array.isArray(json.leagues)) {
        throw new Error("Unexpected leagues response shape.");
      }

      setLeagues(json.leagues);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error while loading leagues.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-xl font-semibold tracking-tight">
            Rex Grossman Memorial Championship Series
          </h1>
          <AuthButton />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {status === "loading" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="text-zinc-300">Checking your session…</p>
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="mb-2 text-2xl font-bold">Sign in required</h2>
            <p className="mb-4 text-zinc-300">
              Please sign in with Yahoo to load your leagues.
            </p>
            <button
              onClick={() => signIn("yahoo")}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-900/30 transition hover:scale-[1.02]"
            >
              Sign in with Yahoo
            </button>
          </div>
        )}

        {status === "authenticated" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Your Yahoo Leagues</h2>
                  <p className="text-zinc-400">
                    Load your leagues and jump into your insights dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={loadLeagues}
                    disabled={loading}
                    className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow transition hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {loading ? "Loading…" : "Load Yahoo Leagues"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              {leagues.length > 0 && !error && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {leagues.map((lg) => (
                    <div
                      key={lg.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-sm transition hover:shadow-lg hover:shadow-purple-900/20"
                    >
                      <div className="text-sm text-zinc-400">Season {lg.season ?? "—"}</div>
                      <div className="mt-1 text-lg font-semibold">{lg.name}</div>
                      <div className="mt-2 text-xs text-zinc-500">League ID: {lg.id}</div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && !error && leagues.length === 0 && (
                <p className="mt-4 text-sm text-zinc-400">
                  No leagues loaded yet. Click{" "}
                  <span className="font-medium text-zinc-200">Load Yahoo Leagues</span>.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
