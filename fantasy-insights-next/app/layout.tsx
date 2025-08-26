// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/AuthSessionProvider";

export const metadata: Metadata = {
  title: "Fantasy Insights",
  description: "ESPN-style weekly insights for your Yahoo league",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
