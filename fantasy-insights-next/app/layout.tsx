// app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";

export const metadata = {
  title: "Rex Grossman League",
  description: "Fantasy Insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">
        <Providers>
          <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
              <Link href="/" className="font-semibold tracking-tight">
                Rex Grossman League
              </Link>

              <nav className="ml-auto flex items-center gap-2">
                {/* Plain anchor style - works even if hydration fails */}
                <Link
                  href="/signin"
                  className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
                  prefetch={false}
                >
                  Sign in
                </Link>
              </nav>
            </div>
          </header>

          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
