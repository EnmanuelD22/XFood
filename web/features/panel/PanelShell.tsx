"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Brand } from "@/components/ui/Brand";
import { IconButton } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { RequireRole } from "@/features/auth/RequireRole";
import { SIGNED_OUT_PATH } from "@/features/auth/routing";
import { useSession } from "@/features/auth/SessionProvider";
import type { Account } from "@/features/auth/types";
import styles from "./PanelShell.module.css";

type NavItem = { href: string; label: string; icon: IconName };

const NAV: NavItem[] = [
  { href: "/panel", label: "Mis publicaciones", icon: "listings" },
  { href: "/panel/categorias", label: "Categorías", icon: "tag" },
  { href: "/panel/configuracion", label: "Configuración", icon: "settings" },
];

/** Establishment workspace: dark sidebar from the approved mock-up, role gate and sign-out. */
export function PanelShell({ children }: { children: ReactNode }) {
  return <RequireRole role="Establishment">{(account) => <Shell account={account}>{children}</Shell>}</RequireRole>;
}

function Shell({ account, children }: { account: Account; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const name = account.displayName || account.establishments?.find((item) => item.isPrimary)?.name || "Establecimiento";

  async function leave() {
    setSigningOut(true);
    setError("");
    try {
      await signOut();
      router.replace(SIGNED_OUT_PATH);
    } catch (reason) {
      setError((reason as Error).message || "No se pudo cerrar la sesión.");
      setSigningOut(false);
    }
  }

  return <div className={styles.shell}>
    <a className="skip-link" href="#contenido">Ir al contenido</a>
    <aside className={styles.sidebar}>
      <Brand href="/panel" tone="light" tagline="Menos desperdicio, más vida" className={styles.brand} />
      <nav className={styles.nav} aria-label="Panel del establecimiento">
        <ul>
          {NAV.map((item) => {
            const active = item.href === "/panel" ? pathname === item.href : pathname.startsWith(item.href);
            return <li key={item.href}>
              <Link href={item.href} className={styles.navLink} aria-current={active ? "page" : undefined}>
                <Icon name={item.icon} size={22} /><span>{item.label}</span>
              </Link>
            </li>;
          })}
          <li>
            <Link href="/buscar" className={styles.navLink}><Icon name="search" size={22} /><span>Búsqueda pública</span></Link>
          </li>
        </ul>
      </nav>
      <div className={styles.footer}>
        <div className={styles.quote}>
          <Icon name="sprout" size={28} />
          <p>Juntos aprovechamos mejor los alimentos</p>
        </div>
        <div className={styles.account}>
          <span className={styles.avatar} aria-hidden="true">{name.slice(0, 1).toLocaleUpperCase("es")}</span>
          <span className={styles.accountText}>
            <strong>{name}</strong>
            <small>{account.email ?? "Cuenta de establecimiento"}</small>
          </span>
          <IconButton icon="logout" label={signingOut ? "Cerrando sesión…" : "Cerrar sesión"} variant="onDark"
            onClick={() => void leave()} disabled={signingOut} />
        </div>
      </div>
    </aside>
    <div className={styles.main} id="contenido" tabIndex={-1}>
      {error && <div className={styles.error}><Notice tone="error">{error}</Notice></div>}
      {children}
    </div>
  </div>;
}
