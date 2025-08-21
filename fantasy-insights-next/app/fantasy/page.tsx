"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import AuthButton from "../../components/AuthButton";

type League = {
  id: string;
  name: string;
  season?: string;
};

type LeaguesOK = { leagues: League[] };

export default function FantasyPage() {
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

      const json = (await res.json()) as LeaguesOK;

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

      <section className="mx-auto max-w-6xl px-6 py-8">
        {status !== "authenticated" ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-zinc-300">
            <p className="mb-4">Sign in with Yahoo to load your leagues.</p>
            <button
              onClick={() => signIn("yahoo")}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
            >
              Sign in
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={loadLeagues}
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 disabled:opacity-60"
              >
                {loading ? "Loading…" : "Load Yahoo Leagues"}
              </button>
              {error && <span className="text-sm text-red-400">{error}</span>}
            </div>

            {leagues.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {leagues.map((lg) => (
                  <div
                    key={lg.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
                  >
                    <h3 className="text-lg font-semibold text-zinc-100">{lg.name}</h3>
                    {lg.season && (
                      <p className="text-sm text-zinc-400">Season: {lg.season}</p>
                    )}
                    <p className="mt-1 text-xs text-zinc-500">League ID: {lg.id}</p>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && leagues.length === 0 && (
              <p className="text-zinc-400">No leagues loaded yet.</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
