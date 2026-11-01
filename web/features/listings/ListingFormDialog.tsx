import type { FormEvent } from "react";
import styles from "@/app/page.module.css";
import type { Category, FieldErrors, FormValues, Listing } from "./types";
import { PanelDialog } from "./PanelDialog";

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
  const fieldError = (key: keyof FieldErrors) => errors[key]?.[0];
  const error = (key: keyof FieldErrors) => fieldError(key) ? <small id={`error-${key}`} className={styles.fieldError}>{fieldError(key)}</small> : null;
  const inputProps = (key: keyof FieldErrors) => ({ "aria-invalid": Boolean(fieldError(key)), "aria-describedby": fieldError(key) ? `error-${key}` : undefined });

  return <PanelDialog labelledBy="form-title" busy={saving} onClose={onClose}>
      <header className={styles.modalHeader}><div><span className={styles.eyebrow}>{editing ? "ACTUALIZA TU EXCEDENTE" : "NUEVA PUBLICACIÓN"}</span><h2 id="form-title">{editing ? "Editar publicación" : "Publicar excedente"}</h2></div>
        <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar" disabled={saving}>×</button></header>
      {!categoryPathReady && <div className={styles.noticeWarning}>El catálogo de categorías no está configurado.</div>}
      {!categories.length && categoryPathReady && <div className={styles.noticeWarning}>{categoryLoadError ? `No se pudo cargar el catálogo: ${categoryLoadError}` : "No hay categorías activas disponibles. Verifica que la migración del catálogo esté aplicada."} No se puede enviar sin una categoría activa.</div>}
      {formError && <div className={styles.noticeError} role="alert"><span>!</span><div>{formError}</div></div>}
      <form onSubmit={onSubmit} className={styles.form} noValidate>
        <fieldset disabled={saving} className={styles.formGrid}><legend className={styles.srOnly}>Datos de la publicación</legend>
          <label className={styles.full}>Título *<input maxLength={200} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Ej. Canasta de frutas frescas" {...inputProps("title")} />{error("title")}</label>
          <label className={styles.full}>Descripción *<textarea maxLength={4000} rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Cuéntale a las personas qué incluye el excedente" {...inputProps("description")} />{error("description")}</label>
          <label>Categoría *<select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} {...inputProps("categoryId")}><option value="">Selecciona una categoría</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{error("categoryId")}</label>
          <label>Cantidad inicial *<input type="number" min="1" step="1" value={form.initialQuantity} onChange={(e) => update("initialQuantity", e.target.value)} {...inputProps("initialQuantity")} />{error("initialQuantity")}</label>
          <label>Precio original (DOP) *<input type="number" min="0.01" step="0.01" value={form.originalUnitPrice} onChange={(e) => update("originalUnitPrice", e.target.value)} {...inputProps("originalUnitPrice")} />{error("originalUnitPrice")}</label>
          <label>Precio con descuento (DOP) *<input type="number" min="0.01" step="0.01" value={form.discountedUnitPrice} onChange={(e) => update("discountedUnitPrice", e.target.value)} {...inputProps("discountedUnitPrice")} />{error("discountedUnitPrice")}</label>
          <label className={styles.full}>Indicaciones de recogida *<textarea maxLength={2000} rows={2} value={form.pickupInstructions} onChange={(e) => update("pickupInstructions", e.target.value)} placeholder="¿Dónde y cómo recogerlo?" {...inputProps("pickupInstructions")} />{error("pickupInstructions")}</label>
          <label>Inicio de recogida · {timeZone}<input type="datetime-local" value={form.pickupStartsAt} onChange={(e) => update("pickupStartsAt", e.target.value)} {...inputProps("pickupDeadline")} /></label>
          <label>Límite de recogida · {timeZone}<input type="datetime-local" value={form.pickupDeadline} onChange={(e) => update("pickupDeadline", e.target.value)} {...inputProps("pickupDeadline")} />{error("pickupDeadline")}</label>
          <label className={styles.full}>Instrucciones de pago *<input maxLength={1000} value={form.paymentInstructions} onChange={(e) => update("paymentInstructions", e.target.value)} {...inputProps("paymentInstructions")} />{error("paymentInstructions")}</label>
          {!editing && <label className={`${styles.full} ${styles.checkboxLabel}`}><input type="checkbox" {...inputProps("foodSafetyDeclared")} checked={form.foodSafetyDeclared} onChange={(e) => update("foodSafetyDeclared", e.target.checked)} /> Declaro que los alimentos son aptos para consumo. *{error("foodSafetyDeclared")}</label>}
        </fieldset>
        <div className={styles.formFootnote}>La modalidad de esta publicación es venta y la moneda es DOP, según la API.</div>
        <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className={styles.primaryButton} disabled={saving || !categoryPathReady || categories.length === 0}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Publicar excedente"}</button></div>
      </form>
  </PanelDialog>;
}
