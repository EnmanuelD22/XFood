"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { ACCESS_DENIED_PATH, homePathFor, LOGIN_PATH } from "./routing";
import { useSession } from "./SessionProvider";
import styles from "./AuthPages.module.css";

const ROLE_LABELS: Record<string, string> = {
  Consumer: "consumidor",
  Establishment: "establecimiento",
  Organization: "organización",
  Administrator: "administrador",
};

export function AccessDenied() {
  const { session, signOut } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const account = session.status === "authenticated" ? session.account : null;
  const home = account ? homePathFor(account) : "/";

  async function leave() {
    try {
      await signOut();
      router.replace(`${LOGIN_PATH}?sesion=cerrada`);
    } catch (reason) {
      setError((reason as Error).message || "No se pudo cerrar la sesión.");
    }
  }

  return <section className={styles.message} aria-labelledby="denied-title">
    <span className={styles.messageIcon}><Icon name="shield" size={32} /></span>
    <h1 id="denied-title">No tienes acceso a esta sección</h1>
    <p>
      {account
        ? `Tu cuenta de ${ROLE_LABELS[account.role] ?? account.role.toLowerCase()} no puede abrir esta página del panel web.`
        : "Inicia sesión con una cuenta que tenga permiso para ver esta página."}
      {account?.role === "Administrator" && " Las herramientas de administración todavía no están disponibles en la web."}
    </p>
    {error && <Notice tone="error">{error}</Notice>}
    <div className={styles.messageActions}>
      {account && home !== ACCESS_DENIED_PATH && <ButtonLink href={home} iconEnd="arrowRight">Ir a mi inicio</ButtonLink>}
      {!account && <ButtonLink href={LOGIN_PATH} iconEnd="arrowRight">Iniciar sesión</ButtonLink>}
      <ButtonLink href="/buscar" variant="secondary">Buscar ofertas</ButtonLink>
      {account && <Button variant="ghost" icon="logout" onClick={() => void leave()}>Cerrar sesión</Button>}
    </div>
  </section>;
}
