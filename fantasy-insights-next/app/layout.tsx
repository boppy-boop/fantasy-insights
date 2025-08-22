// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Rex Grossman Championship S League",
  description: "Modern ESPN-style fantasy league site with weekly insights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased">
        <Providers>
          <SiteHeader />
          {/* Offset so content clears the sticky header */}
          <div className="pt-2">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
