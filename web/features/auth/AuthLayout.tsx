import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
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
        <HeroArt />
      </section>
      <div className={styles.formSide}>
        <div className={`${styles.card} ${wide ? styles.wide : ""}`} id="formulario">{children}</div>
      </div>
    </main>
  </>;
}

/** Original decorative illustration: a market crate with produce, drawn with the XFood palette. */
function HeroArt() {
  return <svg className={styles.art} viewBox="0 0 520 300" aria-hidden="true" focusable="false">
    <ellipse cx="260" cy="286" rx="230" ry="12" fill="#0b2a1c" opacity="0.35" />
    <path d="M140 120c-20-60 10-100 40-110-5 40 5 80-10 115zM175 118c0-55 30-90 70-95-15 35-25 70-40 100zM110 128c-35-35-40-75-25-100 20 25 40 55 45 95z" fill="#5f9a4a" />
    <path d="M300 112c10-55 50-80 85-80-20 30-35 60-55 90zM350 120c20-45 60-60 90-55-25 25-45 45-65 70z" fill="#7cb85a" />
    <circle cx="190" cy="138" r="34" fill="#e4572e" />
    <path d="M190 104c4-10 12-14 20-14-3 8-9 12-20 14z" fill="#3f7d32" />
    <circle cx="245" cy="146" r="28" fill="#f2b33d" />
    <circle cx="300" cy="140" r="32" fill="#d9452b" />
    <path d="M330 150c40-30 90-28 120-10-30 25-80 30-120 10z" fill="#f08a24" />
    <circle cx="380" cy="150" r="26" fill="#a5c94b" />
    <circle cx="130" cy="150" r="24" fill="#c7ea67" />
    <rect x="70" y="160" width="380" height="110" rx="10" fill="#b9864f" />
    <rect x="70" y="160" width="380" height="18" rx="6" fill="#d19d63" />
    <path d="M70 205h380M70 238h380" stroke="#9b6c3c" strokeWidth="5" />
    <path d="M100 178v92M420 178v92" stroke="#9b6c3c" strokeWidth="6" />
    <g transform="rotate(-6 360 223)">
      <rect x="300" y="190" width="120" height="66" rx="8" fill="#1d2b22" />
      <path d="M318 215c12-4 22 2 34-2s22-6 40 0M322 234c14-3 24 1 36-1" stroke="#eef4ea" strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  </svg>;
}
