import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/ui/Brand";
import { SessionActions } from "@/features/auth/SessionActions";
import styles from "./PublicHeader.module.css";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/buscar", label: "Buscar ofertas" },
  { href: "/#negocios", label: "Para negocios" },
  { href: "/#impacto", label: "Impacto" },
];

/** Top bar of public pages; by default the right side shows the session controls. */
export function PublicHeader({ current, actions }: { current?: string; actions?: ReactNode }) {
  return <header className={styles.header}>
    <div className={styles.inner}>
      <Brand />
      <nav className={styles.nav} aria-label="Principal">
        <ul>
          {LINKS.map((link) => <li key={link.href}>
            <Link href={link.href} aria-current={current === link.href ? "page" : undefined}>{link.label}</Link>
          </li>)}
        </ul>
      </nav>
      <div className={styles.actions}>{actions ?? <SessionActions />}</div>
    </div>
  </header>;
}
