"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/ui/Dialog";
import { CheckboxField, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import styles from "./ListingForm.module.css";
import type { Category, FieldErrors, FormValues, Listing } from "./types";

type Props = {
  categories: Category[];
  categoryPathReady: boolean;
  categoryLoadError: string;
  editing: Listing | null;
  errors: FieldErrors;
  form: FormValues;
  formError: string;
  saving: boolean;
  timeZone: string;
  onChange: (form: FormValues) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ListingFormDialog(props: Props) {
  const { categories, categoryPathReady, categoryLoadError, editing, errors, form, formError, saving, timeZone, onChange, onClose, onSubmit } = props;
  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => onChange({ ...form, [key]: value });
  const error = (key: keyof FormValues) => errors[key]?.[0];
  const canSubmit = categoryPathReady && categories.length > 0;

  return <Dialog labelledBy="form-title" busy={saving} size="lg" onClose={onClose}>
    <DialogHeader titleId="form-title" eyebrow={editing ? "Actualiza tu excedente" : "Nueva publicación"}
      title={editing ? "Editar publicación" : "Publicar excedente"} busy={saving} onClose={onClose} />
    <form onSubmit={onSubmit} noValidate>
      <DialogBody>
        {!categoryPathReady && <Notice tone="warning">El catálogo de categorías no está configurado.</Notice>}
        {!categories.length && categoryPathReady && <Notice tone="warning">
          {categoryLoadError ? `No se pudo cargar el catálogo: ${categoryLoadError}` : "No hay categorías activas disponibles. Verifica que la migración del catálogo esté aplicada."} No se puede enviar sin una categoría activa.
        </Notice>}
        {formError && <Notice tone="error">{formError}</Notice>}
        <fieldset disabled={saving} className={styles.fieldset}>
          <legend className="sr-only">Datos de la publicación</legend>
          <p className={styles.group} aria-hidden="true">Qué ofreces</p>
          <TextField className={styles.full} label="Título" required maxLength={200} value={form.title}
            onChange={(e) => update("title", e.target.value)} placeholder="Ej. Canasta de frutas frescas" error={error("title")} />
          <TextAreaField className={styles.full} label="Descripción" required maxLength={4000} rows={3} value={form.description}
            onChange={(e) => update("description", e.target.value)} placeholder="Cuéntale a las personas qué incluye el excedente" error={error("description")} />
          <SelectField label="Categoría" required value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} error={error("categoryId")}>
            <option value="">Selecciona una categoría</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </SelectField>
          <TextField label="Cantidad inicial" required type="number" inputMode="numeric" min="1" step="1" value={form.initialQuantity}
            onChange={(e) => update("initialQuantity", e.target.value)} error={error("initialQuantity")} />

          <p className={styles.group} aria-hidden="true">Precio</p>
          <TextField label="Precio original (DOP)" required type="number" inputMode="decimal" min="0.01" step="0.01" value={form.originalUnitPrice}
            onChange={(e) => update("originalUnitPrice", e.target.value)} error={error("originalUnitPrice")} />
          <TextField label="Precio con descuento (DOP)" required type="number" inputMode="decimal" min="0.01" step="0.01" value={form.discountedUnitPrice}
            onChange={(e) => update("discountedUnitPrice", e.target.value)} error={error("discountedUnitPrice")} />

          <p className={styles.group} aria-hidden="true">Recogida y pago</p>
          <TextField label="Inicio de recogida" hint={`Hora de ${timeZone}`} required type="datetime-local" value={form.pickupStartsAt}
            onChange={(e) => update("pickupStartsAt", e.target.value)} aria-invalid={Boolean(error("pickupDeadline")) || undefined} />
          <TextField label="Límite de recogida" hint={`Hora de ${timeZone}`} required type="datetime-local" value={form.pickupDeadline}
            onChange={(e) => update("pickupDeadline", e.target.value)} error={error("pickupDeadline")} />
          <TextAreaField className={styles.full} label="Indicaciones de recogida" required maxLength={2000} rows={2} value={form.pickupInstructions}
            onChange={(e) => update("pickupInstructions", e.target.value)} placeholder="¿Dónde y cómo recogerlo?" error={error("pickupInstructions")} />
          <TextField className={styles.full} label="Instrucciones de pago" required maxLength={1000} value={form.paymentInstructions}
            onChange={(e) => update("paymentInstructions", e.target.value)} error={error("paymentInstructions")} />
          {!editing && <CheckboxField className={styles.full} label="Declaro que los alimentos son aptos para consumo."
            checked={form.foodSafetyDeclared} onChange={(e) => update("foodSafetyDeclared", e.target.checked)} error={error("foodSafetyDeclared")} />}
        </fieldset>
        <p className={styles.footnote}>Los campos con * son obligatorios. La modalidad es venta y la moneda es DOP, según la API.</p>
      </DialogBody>
      <DialogActions>
        <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button type="submit" loading={saving} disabled={!canSubmit} icon={editing ? "check" : "plus"}>
          {saving ? "Guardando…" : editing ? "Guardar cambios" : "Publicar excedente"}
        </Button>
      </DialogActions>
    </form>
  </Dialog>;
}
