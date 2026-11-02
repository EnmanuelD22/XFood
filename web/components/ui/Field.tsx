"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Field.module.css";

type Common = {
  label: ReactNode;
  hint?: ReactNode;
  /** First server or client message for the field; it is linked through `aria-describedby`. */
  error?: string;
  className?: string;
};

/** Ids and ARIA wiring shared by every field so labels, hints and errors stay associated. */
function useFieldIds(id: string | undefined, hint: ReactNode, error: string | undefined) {
  const generated = useId();
  const inputId = id ?? generated;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return {
    inputId,
    hintId,
    errorId,
    aria: {
      "aria-invalid": error ? true : undefined,
      "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
    },
  };
}

function Shell({ inputId, label, required, hint, hintId, error, errorId, className, children }: Common & {
  inputId: string; required?: boolean; hintId?: string; errorId?: string; children: ReactNode;
}) {
  return <div className={[styles.field, className].filter(Boolean).join(" ")}>
    <label className={styles.label} htmlFor={inputId}>
      {label}{required && <span className={styles.required} aria-hidden="true"> *</span>}
    </label>
    {children}
    {hint && <p id={hintId} className={styles.hint}>{hint}</p>}
    {error && <p id={errorId} className={styles.error}><Icon name="alert" size={16} />{error}</p>}
  </div>;
}

type TextFieldProps = Common & Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  icon?: IconName;
  /** Adds a show/hide control to password inputs. */
  revealable?: boolean;
};

export function TextField({ label, hint, error, className, icon, revealable = false, id, type = "text", required, ...input }: TextFieldProps) {
  const { inputId, hintId, errorId, aria } = useFieldIds(id, hint, error);
  const [revealed, setRevealed] = useState(false);
  const canReveal = revealable && type === "password";

  return <Shell inputId={inputId} label={label} required={required} hint={hint} hintId={hintId} error={error} errorId={errorId} className={className}>
    <div className={[styles.control, icon && styles.withIcon, canReveal && styles.withAction].filter(Boolean).join(" ")}>
      {icon && <Icon name={icon} size={20} className={styles.leadingIcon} />}
      <input id={inputId} type={canReveal && revealed ? "text" : type} required={required} className={styles.input} {...aria} {...input} />
      {canReveal && <button type="button" className={styles.action} onClick={() => setRevealed(!revealed)}
        aria-label={revealed ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={revealed} aria-controls={inputId} disabled={input.disabled}>
        <Icon name={revealed ? "eyeOff" : "eye"} size={20} />
      </button>}
    </div>
  </Shell>;
}

type TextAreaFieldProps = Common & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

export function TextAreaField({ label, hint, error, className, id, required, ...textarea }: TextAreaFieldProps) {
  const { inputId, hintId, errorId, aria } = useFieldIds(id, hint, error);
  return <Shell inputId={inputId} label={label} required={required} hint={hint} hintId={hintId} error={error} errorId={errorId} className={className}>
    <textarea id={inputId} required={required} className={`${styles.input} ${styles.textarea}`} {...aria} {...textarea} />
  </Shell>;
}

type SelectFieldProps = Common & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & { children: ReactNode };

export function SelectField({ label, hint, error, className, id, required, children, ...select }: SelectFieldProps) {
  const { inputId, hintId, errorId, aria } = useFieldIds(id, hint, error);
  return <Shell inputId={inputId} label={label} required={required} hint={hint} hintId={hintId} error={error} errorId={errorId} className={className}>
    <div className={`${styles.control} ${styles.selectControl}`}>
      <select id={inputId} required={required} className={`${styles.input} ${styles.select}`} {...aria} {...select}>{children}</select>
      <Icon name="chevronDown" size={18} className={styles.chevron} />
    </div>
  </Shell>;
}

type CheckboxFieldProps = Omit<Common, "hint"> & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type">;

export function CheckboxField({ label, error, className, id, ...input }: CheckboxFieldProps) {
  const { inputId, errorId, aria } = useFieldIds(id, undefined, error);
  return <div className={[styles.checkboxField, className].filter(Boolean).join(" ")}>
    <input id={inputId} type="checkbox" className={styles.checkbox} {...aria} {...input} />
    <label htmlFor={inputId}>{label}</label>
    {error && <p id={errorId} className={styles.error}><Icon name="alert" size={16} />{error}</p>}
  </div>;
}
