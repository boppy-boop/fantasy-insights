import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

import Providers from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-100 text-neutral-900">
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-neutral-950/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-7 w-7 rounded bg-red-600" />
              <span className="text-lg font-extrabold tracking-tight text-white">RG Championship</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-neutral-200">
              <Link href="/fantasy" className="hover:text-white">2025 Season</Link>
              <Link href="/history" className="hover:text-white">History</Link>
              <Link href="/records" className="hover:text-white">Records</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8"><Providers>{children}</Providers></main>
        <footer className="mt-16 border-t border-neutral-200 bg-white/60">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-600">© 2025 RG Championship Series</div>
        </footer>
      </body>
    </html>
  );
}