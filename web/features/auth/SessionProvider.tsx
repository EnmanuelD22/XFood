"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { isApiError } from "@/lib/api";
import { getCurrentAccount, logout } from "./api";
import type { Account } from "./types";

export type SessionState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; account: Account }
  | { status: "error"; message: string };

type SessionContextValue = {
  session: SessionState;
  /** Asks `GET /me` again; the HttpOnly cookie is the only source of truth. */
  refresh: () => Promise<Account | null>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const request = useRef<AbortController | null>(null);

  /** Starts a `GET /me` that cancels the previous one; state changes only when the API answers. */
  const check = useCallback(() => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    return getCurrentAccount(controller.signal).then(
      (account) => {
        if (controller.signal.aborted) return null;
        setSession({ status: "authenticated", account });
        return account;
      },
      (error: unknown) => {
        if (controller.signal.aborted) return null;
        setSession(sessionFromError(error));
        return null;
      },
    );
  }, []);

  const refresh = useCallback(() => {
    setSession({ status: "loading" });
    return check();
  }, [check]);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      // A session that already ended is the outcome we wanted; any other failure is reported.
      if (!isApiError(error, 401)) throw error;
    }
    request.current?.abort();
    setSession({ status: "anonymous" });
  }, []);

  useEffect(() => {
    void check();
    return () => request.current?.abort();
  }, [check]);

  const value = useMemo(() => ({ session, refresh, signOut }), [session, refresh, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

function sessionFromError(error: unknown): SessionState {
  return isApiError(error, 401)
    ? { status: "anonymous" }
    : { status: "error", message: (error as Error).message || "No se pudo comprobar la sesión." };
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider.");
  return context;
}
