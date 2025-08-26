'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

/** Wraps the app with NextAuth's SessionProvider (client-only). */
export default function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}
