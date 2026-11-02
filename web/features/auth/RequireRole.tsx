"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageStatus } from "@/components/layout/PageStatus";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { AccessDenied } from "./AccessDenied";
import { loginPathFor, SIGNED_OUT_PATH } from "./routing";
import { useSession } from "./SessionProvider";
import type { Account } from "./types";

/**
 * Client-side gate for role sections. It improves navigation only: the API authorizes every request,
 * so hiding a page here is never the security boundary.
 */
export function RequireRole({ role, children }: { role: string; children: (account: Account) => ReactNode }) {
  const { session, refresh } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "anonymous") {
      router.replace(loginPathFor(`${window.location.pathname}${window.location.search}`));
    } else if (session.status === "signedOut") {
      router.replace(SIGNED_OUT_PATH);
    }
  }, [router, session.status]);

  if (session.status === "loading") return <PageStatus label="Comprobando tu sesión…" />;
  if (session.status === "anonymous" || session.status === "signedOut") return <PageStatus label="Redirigiendo al inicio de sesión…" />;
  if (session.status === "error") {
    return <PageStatus label="No pudimos comprobar tu sesión.">
      <Notice tone="error">{session.message}</Notice>
      <Button variant="secondary" icon="refresh" onClick={() => void refresh()}>Volver a intentar</Button>
    </PageStatus>;
  }
  if (session.account.role !== role || session.account.status !== "Active") return <AccessDenied />;
  return children(session.account);
}
