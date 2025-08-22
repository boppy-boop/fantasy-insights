"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  // No props needed — SessionProvider will fetch /api/auth/session on the client.
  return <SessionProvider>{children}</SessionProvider>;
}
