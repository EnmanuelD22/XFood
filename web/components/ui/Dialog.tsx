"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { IconButton } from "./Button";
import styles from "./Dialog.module.css";

/** Native modal semantics keep focus inside, make the background inert and restore focus on close. */
export function Dialog({ children, labelledBy, busy = false, size = "md", onClose }: {
  children: ReactNode; labelledBy: string; busy?: boolean; size?: "md" | "lg"; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return <dialog ref={dialog} className={`${styles.dialog} ${styles[size]}`} aria-labelledby={labelledBy} aria-busy={busy}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    {children}
  </dialog>;
}

export function DialogHeader({ titleId, title, eyebrow, busy = false, onClose }: {
  titleId: string; title: ReactNode; eyebrow?: ReactNode; busy?: boolean; onClose: () => void;
}) {
  return <header className={styles.header}>
    <div>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2 id={titleId} className={styles.title}>{title}</h2>
    </div>
    <IconButton icon="close" label="Cerrar" variant="secondary" onClick={onClose} disabled={busy} />
  </header>;
}

export function DialogBody({ children }: { children: ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

/** Sticky on small screens so the main action is always reachable. */
export function DialogActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}
