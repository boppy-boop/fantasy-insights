// components/AuthButton.tsx
"use client";

import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const callbackUrl = pathname || "/";

  if (status === "loading") {
    return (
      <button
        className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300"
        disabled
      >
        Loading…
      </button>
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn(undefined, { callbackUrl })}
        className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600"
      >
        Sign in
      </button>
    );
  }

  const firstName =
    (session.user?.name?.split(" ")[0] ?? "Manager").trim();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-300">Hi, {firstName}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
      >
        Sign out
      </button>
    </div>
  );
}
