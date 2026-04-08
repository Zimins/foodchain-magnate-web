"use client";

import { GameProvider } from "@/lib/gameContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}
