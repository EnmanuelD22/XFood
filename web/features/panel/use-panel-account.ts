"use client";

import { useSession } from "@/features/auth/SessionProvider";

/** Account of the signed-in establishment; only valid inside `PanelShell`, which has already checked the role. */
export function usePanelAccount() {
  const { session } = useSession();
  if (session.status !== "authenticated") throw new Error("usePanelAccount must be used inside PanelShell.");
  return session.account;
}
