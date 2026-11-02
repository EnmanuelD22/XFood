import Link from "next/link";
import styles from "./Brand.module.css";

/** XFood logotype: an original two-leaf mark followed by the name. */
export function Brand({ href = "/", tone = "dark", tagline, className }: {
  href?: string; tone?: "dark" | "light"; tagline?: string; className?: string;
}) {
  return <Link href={href} className={[styles.brand, styles[tone], className].filter(Boolean).join(" ")}>
    <svg className={styles.mark} viewBox="0 0 40 40" width="36" height="36" aria-hidden="true" focusable="false">
      <path d="M19 35C9 33 4 24 7 12c9 2 15 9 12 23z" fill="currentColor" opacity="0.75" />
      <path d="M21 35c-1-13 4-23 14-27 3 12-2 24-14 27z" fill="currentColor" />
      <path d="M21 34c2-8 5-14 10-19" stroke="var(--brand-vein)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
    <span className={styles.text}>
      <span className={styles.name}>XFood</span>
      {tagline && <span className={styles.tagline}>{tagline}</span>}
    </span>
  </Link>;
}
