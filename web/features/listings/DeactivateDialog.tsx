"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/ui/Dialog";
import { TextAreaField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";

export function DeactivateDialog({ title, busy, error, onClose, onConfirm }: {
  title: string; busy: boolean; error: string; onClose: () => void; onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return <Dialog labelledBy="deactivate-title" busy={busy} onClose={onClose}>
    <DialogHeader titleId="deactivate-title" eyebrow="Acción permanente" title="Desactivar publicación" busy={busy} onClose={onClose} />
    <form onSubmit={(event) => { event.preventDefault(); onConfirm(reason); }}>
      <DialogBody>
        <p>«{title}» dejará de ofrecerse. Se conservarán la publicación y su historial.</p>
        <TextAreaField label="Motivo de desactivación" required maxLength={1000} rows={4} value={reason} disabled={busy}
          hint="El motivo quedará registrado. Máximo 1000 caracteres." onChange={(event) => setReason(event.target.value)} />
        {error && <Notice tone="error">{error}</Notice>}
      </DialogBody>
      <DialogActions>
        <Button variant="secondary" disabled={busy} onClick={onClose}>Conservar publicación</Button>
        <Button type="submit" variant="danger" loading={busy} disabled={!reason.trim()}>{busy ? "Desactivando…" : "Confirmar desactivación"}</Button>
      </DialogActions>
    </form>
  </Dialog>;
}
