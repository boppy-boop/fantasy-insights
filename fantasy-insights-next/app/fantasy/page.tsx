"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import AuthButton from "../../components/AuthButton"; // <- path is from /app to /components

export default function Home() {
  const { data: session, status } = useSession();
  const firstName =
    (session?.user?.name || session?.user?.email || "Coach").split(" ")[0];

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-zinc-100">
      {/* Top bar */}
      <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Rex Grossman Memorial Championship Series
            </span>
          </h1>
          <AuthButton />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        {status === "authenticated" ? (
          <>
            <p className="text-zinc-300 text-lg">
              Welcome back,{" "}
              <span className="font-semibold text-white">{firstName}</span> 👋
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight">
              Your weekly fantasy edge starts here.
            </h2>

            {/* Action cards */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link
                href="/fantasy"
                className="group rounded-2xl border border-violet-700/40 bg-zinc-900/60 p-6 text-left shadow-lg transition hover:-translate-y-0.5 hover:border-violet-500 hover:shadow-violet-900/30"
              >
                <div className="text-sm text-violet-300">Dashboard</div>
                <div className="mt-2 text-2xl font-semibold">
                  Open League Insights
                </div>
                <p className="mt-2 text-zinc-400">
                  Power rankings, steals & overpays, strength of schedule, and
                  more.
                </p>
                <div className="mt-4 text-violet-300 group-hover:translate-x-1 transition">
                  Enter →
                </div>
              </Link>

              {/* Handy debug tile; safe to remove later */}
              <a
                href="/api/auth/session"
                className="group rounded-2xl border border-emerald-700/40 bg-zinc-900/60 p-6 text-left shadow-lg transition hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-emerald-900/30"
              >
                <div className="text-sm text-emerald-300">Quick Check</div>
                <div className="mt-2 text-2xl font-semibold">
                  View Your Session
                </div>
                <p className="mt-2 text-zinc-400">
                  Inspect session/token if something looks off.
                </p>
                <div className="mt-4 text-emerald-300 group-hover:translate-x-1 transition">
                  Open →
                </div>
              </a>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Rex Grossman Memorial Championship Series
            </h2>
            <p className="mt-4 text-zinc-300">
              Sign in with Yahoo to load your league data and personalized
              insights.
            </p>
            <div className="mt-8 flex justify-center">
              <AuthButton />
            </div>
          </>
        )}
      </section>

      <footer className="py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} RG Championship Series
      </footer>
    </main>
  );
}
