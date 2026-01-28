// src/components/providers/session-provider.tsx
"use client";

import { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function SessionProvider({
  children,
  session,
  refetchInterval,
  refetchOnWindowFocus,
}: {
  children: ReactNode;
  session?: Session;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
}) {
  return (
    <NextAuthSessionProvider
      session={session}
      refetchInterval={refetchInterval}
      refetchOnWindowFocus={refetchOnWindowFocus}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
