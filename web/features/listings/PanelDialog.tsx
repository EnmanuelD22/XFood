"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "@/app/page.module.css";

/** Native modal semantics keep focus inside, make the background inert and restore focus on close. */
export function PanelDialog({ children, labelledBy, busy, onClose }: {
  children: ReactNode; labelledBy: string; busy: boolean; onClose: () => void;
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

  return <dialog ref={dialog} className={styles.modal} aria-labelledby={labelledBy} aria-busy={busy}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    {children}
  </dialog>;
}
