import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { MarketArt } from "@/components/brand/MarketArt";
import { Icon, type IconName } from "@/components/ui/Icon";
import styles from "./AuthLayout.module.css";

const BENEFITS: Array<{ icon: IconName; label: string }> = [
  { icon: "sprout", label: "Menos desperdicio" },
  { icon: "users", label: "Más comunidad" },
  { icon: "globe", label: "Un futuro más sostenible" },
];

/** Split screen from the login mock-up: brand message on the left, the form card on the right. */
export function AuthLayout({ children, headerActions, wide = false }: { children: ReactNode; headerActions?: ReactNode; wide?: boolean }) {
  return <>
    <a className="skip-link" href="#formulario">Ir al formulario</a>
    <PublicHeader actions={headerActions} />
    <main className={styles.page}>
      <section className={styles.hero} aria-label="XFood">
        <div className={styles.heroText}>
          <p className={styles.headline}>Buena comida también puede tener <span>un mejor mañana</span></p>
          <p className={styles.tagline}>Aprovechemos los alimentos juntos.</p>
          <ul className={styles.benefits}>
            {BENEFITS.map((benefit) => <li key={benefit.label}>
              <span className={styles.benefitIcon}><Icon name={benefit.icon} size={22} /></span>{benefit.label}
            </li>)}
          </ul>
        </div>
        <MarketArt className={styles.art} />
      </section>
      <div className={styles.formSide}>
        <div className={`${styles.card} ${wide ? styles.wide : ""}`} id="formulario">{children}</div>
      </div>
    </main>
  </>;
}
