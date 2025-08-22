"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useMemo } from "react";

export default function SiteHeader() {
  const { data: session, status } = useSession();

  const firstName = useMemo(() => {
    const raw =
      (session?.user?.name && session.user.name.trim()) ||
      (session?.user?.email && session.user.email.split("@")[0]) ||
      "Manager";
    const tok = raw.split(/\s+/)[0];
    return tok.charAt(0).toUpperCase() + tok.slice(1);
  }, [session?.user?.name, session?.user?.email]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-red-600" />
            <span className="text-sm font-bold tracking-wide text-white">
              Rex Grossman League
            </span>
          </Link>
          <nav className="hidden items-center gap-2 sm:flex">
            <Link
              href="/fantasy?season=2025&week=preseason"
              className="rounded-md px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
            >
              2025
            </Link>
            <Link
              href="/owners"
              className="rounded-md px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
            >
              Owners
            </Link>
            <Link
              href="/history"
              className="rounded-md px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
            >
              History
            </Link>
            <Link
              href="/records"
              className="rounded-md px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
            >
              Records
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {status === "authenticated" ? (
            <>
              <span className="hidden text-xs text-zinc-300 sm:inline">
                Hi, <span className="font-semibold text-zinc-100">{firstName}</span>
              </span>
              <button
                onClick={() => void signOut()}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => void signIn()}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
