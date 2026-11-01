"use client";

import { useState } from "react";
import styles from "@/app/page.module.css";
import { PanelDialog } from "./PanelDialog";

export function DeactivateDialog({ title, busy, error, onClose, onConfirm }: {
  title: string; busy: boolean; error: string; onClose: () => void; onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return <PanelDialog labelledBy="deactivate-title" busy={busy} onClose={onClose}>
    <header className={styles.modalHeader}><h2 id="deactivate-title">Desactivar publicación</h2>
      <button className={styles.closeButton} disabled={busy} onClick={onClose} aria-label="Cerrar">×</button></header>
    <p>«{title}» dejará de ofrecerse. Se conservarán la publicación y su historial.</p>
    <form className={styles.form} onSubmit={(event) => { event.preventDefault(); onConfirm(reason); }}>
      <div className={styles.formGrid}><label className={styles.full}>Motivo de desactivación
        <textarea required maxLength={1000} rows={4} value={reason} disabled={busy}
          aria-describedby="deactivate-help" onChange={(event) => setReason(event.target.value)} /></label></div>
      <small id="deactivate-help">El motivo quedará registrado. Máximo 1000 caracteres.</small>
      {error && <p className={styles.noticeError} role="alert">{error}</p>}
      <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} disabled={busy} onClick={onClose}>Conservar publicación</button>
        <button className={styles.primaryButton} disabled={busy || !reason.trim()}>{busy ? "Desactivando…" : "Confirmar desactivación"}</button></div>
    </form>
  </PanelDialog>;
}
