// app/page.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const userName =
    (session?.user?.name ?? "")
      .split(" ")
      .filter(Boolean)
      .at(0) || "Manager";

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-gradient-to-r from-purple-900/60 to-indigo-900/60">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Fantasy Insights
          </h1>

          <nav className="flex items-center gap-3">
            {session ? (
              <>
                <span className="text-zinc-300 text-sm hidden sm:inline">
                  Hi, <span className="font-semibold text-white">{userName}</span>
                </span>
                <form action="/api/auth/signout" method="post">
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/signin"
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-500"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white">
            {session ? `Welcome back, ${userName}!` : "Welcome to Fantasy Insights"}
          </h2>
          <p className="mt-3 text-zinc-400">
            ESPN-style dashboards for your Yahoo league: weekly notes, waivers, power
            rankings, strength of schedule, and more—auto-generated and styled for the 2025 season.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/fantasy"
              className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-500"
            >
              Go to League Hub
            </Link>

            {!session && (
              <Link
                href="/signin"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 font-medium text-zinc-200 hover:bg-zinc-700"
              >
                Sign in with Yahoo
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
