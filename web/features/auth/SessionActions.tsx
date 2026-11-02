"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ButtonLink, IconButton } from "@/components/ui/Button";
import { ACCESS_DENIED_PATH, homePathFor, LOGIN_PATH, SIGNED_OUT_PATH } from "./routing";
import { useSession } from "./SessionProvider";
import styles from "./SessionActions.module.css";

const HOME_LABELS: Record<string, string> = {
  Establishment: "Mi panel",
  Organization: "Mi organización",
};

/** Right side of the public header: sign-in links for visitors, account shortcuts and sign-out for members. */
export function SessionActions() {
  const { session, signOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");

  if (session.status === "loading") return <span className={styles.placeholder} aria-hidden="true" />;
  if (session.status !== "authenticated") {
    return <ButtonLink href={pathname === LOGIN_PATH ? "/registro" : LOGIN_PATH} variant="soft" size="sm">
      {pathname === LOGIN_PATH ? "Crear cuenta" : "Iniciar sesión"}
    </ButtonLink>;
  }

  const { account } = session;
  const home = homePathFor(account);
  const name = account.displayName || account.email || "Mi cuenta";

  async function leave() {
    setLeaving(true);
    setError("");
    try {
      await signOut();
      router.replace(SIGNED_OUT_PATH);
    } catch (reason) {
      setLeaving(false);
      setError((reason as Error).message || "No se pudo cerrar la sesión.");
    }
  }

  return <div className={styles.account}>
    {HOME_LABELS[account.role] && home !== ACCESS_DENIED_PATH && pathname !== home &&
      <ButtonLink href={home} variant="soft" size="sm">{HOME_LABELS[account.role]}</ButtonLink>}
    <span className={styles.avatar} title={name} aria-hidden="true">{name.slice(0, 1).toLocaleUpperCase("es")}</span>
    <span className="sr-only">Sesión iniciada como {name}</span>
    <IconButton icon="logout" label={leaving ? "Cerrando sesión…" : "Cerrar sesión"} onClick={() => void leave()} disabled={leaving} />
    {error && <span className={styles.error} role="alert">{error}</span>}
  </div>;
}
