// app/providers.tsx
"use client";

import React, { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: ReactNode }) {
  // You can pass options to SessionProvider if needed, e.g. `refetchInterval`
  return <SessionProvider>{children}</SessionProvider>;
}
