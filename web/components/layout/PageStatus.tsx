import type { ReactNode } from "react";
import styles from "./PageStatus.module.css";

/** Centered, announced placeholder for whole-page waits (session checks, redirects). */
export function PageStatus({ label, children }: { label: string; children?: ReactNode }) {
  return <div className={styles.status} role="status" aria-live="polite">
    <span className={styles.spinner} aria-hidden="true" />
    <p>{label}</p>
    {children}
  </div>;
}
