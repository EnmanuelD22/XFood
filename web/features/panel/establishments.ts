import type { Account, Establishment } from "../auth/types";

export function activeEstablishments(account: Account): Establishment[] {
  return (account.establishments ?? []).filter((item) => item.status === "Active");
}

/** The one in the URL wins; otherwise the only one, otherwise the primary. `undefined` asks the person to choose. */
export function pickEstablishment(account: Account, requestedId: string | null): Establishment | undefined {
  const active = activeEstablishments(account);
  return active.find((item) => item.id === requestedId)
    ?? (active.length === 1 ? active[0] : active.find((item) => item.isPrimary));
}
