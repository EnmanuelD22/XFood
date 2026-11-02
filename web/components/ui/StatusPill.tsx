import styles from "./StatusPill.module.css";

export type StatusTone = "success" | "warning" | "neutral" | "error" | "info";

export function StatusPill({ tone, children, className }: { tone: StatusTone; children: string; className?: string }) {
  return <span className={[styles.pill, styles[tone], className].filter(Boolean).join(" ")}>
    <span className={styles.dot} aria-hidden="true" />{children}
  </span>;
}
