"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { ApiRequestError, isApiError } from "@/lib/api";
import { register } from "./api";
import { LocationPicker } from "./LocationPicker";
import {
  buildRegisterRequest,
  EMPTY_REGISTRATION,
  normalizeServerErrors,
  profileKey,
  validateRegistration,
  type RegisterErrors,
  type RegisterValues,
  type RegistrableRole,
} from "./registration";
import styles from "./AuthForm.module.css";

const ROLES: Array<{ value: RegistrableRole; label: string; hint: string; icon: IconName }> = [
  { value: "Consumer", label: "Consumidor", hint: "Encuentra ofertas cerca de ti", icon: "user" },
  { value: "Establishment", label: "Establecimiento", hint: "Publica tus excedentes", icon: "store" },
  { value: "Organization", label: "Organización", hint: "Recibe donaciones", icon: "heart" },
];

export function RegisterForm() {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<RegisterValues>(EMPTY_REGISTRATION);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const prefix = profileKey(values.role);
  const error = (key: string) => errors[key]?.[0];
  const update = <K extends keyof RegisterValues>(key: K, value: RegisterValues[K]) => setValues((current) => ({ ...current, [key]: value }));

  /** Focus moves to the first field with a problem so keyboard and screen reader users land on it. */
  function focusFirstInvalid() {
    requestAnimationFrame(() => form.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const found = validateRegistration(values);
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) {
      setFormError("Revisa los campos marcados.");
      focusFirstInvalid();
      return;
    }

    setSubmitting(true);
    try {
      await register(buildRegisterRequest(values));
      // Registration does not open a session: the next step is always the login page.
      router.push(`/login?registro=ok${values.role === "Organization" ? "&verificacion=pendiente" : ""}`);
    } catch (reason) {
      setSubmitting(false);
      if (isApiError(reason, 400) && reason.payload.errors) {
        setErrors(normalizeServerErrors(reason.payload.errors));
        setFormError(reason.message || "Revisa los campos marcados.");
        focusFirstInvalid();
        return;
      }
      setFormError(reason instanceof ApiRequestError ? reason.message : "No se pudo conectar con XFood. Revisa tu conexión e inténtalo de nuevo.");
    }
  }

  return <>
    <header className={styles.header}>
      <h1 className={styles.title}>Crear cuenta</h1>
      <p className={styles.subtitle}>Únete a XFood y aprovechemos los alimentos.</p>
    </header>

    <div className={styles.notices}>{formError && <Notice tone="error">{formError}</Notice>}</div>

    <form ref={form} className={styles.form} onSubmit={submit} noValidate>
      <fieldset className={styles.roleGroup} disabled={submitting}>
        <legend>¿Cómo quieres usar XFood?</legend>
        <div className={styles.roles}>
          {ROLES.map((role) => <label key={role.value} className={styles.role}>
            <input type="radio" name="role" value={role.value} checked={values.role === role.value}
              onChange={() => { update("role", role.value); setErrors({}); }} />
            <span className={styles.roleIcon}><Icon name={role.icon} size={22} /></span>
            <span className={styles.roleName}>{role.label}</span>
            <span className={styles.roleHint}>{role.hint}</span>
          </label>)}
        </div>
      </fieldset>

      <fieldset className={styles.section} disabled={submitting}>
        <legend>Tus datos</legend>
        <TextField className={styles.full} label={values.role === "Consumer" ? "Nombre completo" : "Nombre de la persona responsable"}
          icon="user" autoComplete="name" required maxLength={200} value={values.displayName}
          onChange={(event) => update("displayName", event.target.value)} error={error("displayName")} />
        <TextField label="Correo electrónico" type="email" icon="mail" autoComplete="email" required placeholder="correo@ejemplo.com"
          value={values.email} onChange={(event) => update("email", event.target.value)} error={error("email")} />
        <TextField label="Contraseña" type="password" icon="lock" autoComplete="new-password" required revealable
          hint="Usa mayúsculas, minúsculas, números y un símbolo."
          value={values.password} onChange={(event) => update("password", event.target.value)} error={error("password")} />
      </fieldset>

      {prefix && <fieldset key={prefix} className={styles.section} disabled={submitting}>
        <legend>{values.role === "Establishment" ? "Datos del establecimiento" : "Datos de la organización"}</legend>
        <TextField className={styles.full} label={values.role === "Establishment" ? "Nombre del establecimiento" : "Nombre de la organización"}
          icon={values.role === "Establishment" ? "store" : "heart"} autoComplete="organization" required maxLength={200}
          value={values.name} onChange={(event) => update("name", event.target.value)} error={error(`${prefix}.name`)} />
        <TextField label="Teléfono de contacto" type="tel" icon="phone" autoComplete="tel" required maxLength={32} placeholder="809-555-0102"
          value={values.contactPhone} onChange={(event) => update("contactPhone", event.target.value)} error={error(`${prefix}.contactPhone`)} />
        <TextField label="Dirección" icon="mapPin" autoComplete="street-address" required maxLength={500}
          value={values.address} onChange={(event) => update("address", event.target.value)} error={error(`${prefix}.address`)} />
        {values.role === "Establishment" && <div className={styles.full}>
          <LocationPicker disabled={submitting} error={error("establishment.location")}
            point={values.latitude !== null && values.longitude !== null ? { latitude: values.latitude, longitude: values.longitude } : null}
            onChange={(point) => setValues((current) => ({ ...current, latitude: point.latitude, longitude: point.longitude }))} />
        </div>}
        {values.role === "Organization" && <>
          <TextAreaField className={styles.full} label="Información para la verificación" rows={3} maxLength={2000}
            hint="Opcional. Por ejemplo, el número de registro de la organización. Un administrador revisará la solicitud."
            value={values.verificationInformation} onChange={(event) => update("verificationInformation", event.target.value)}
            error={error("organization.verificationInformation")} />
          <div className={styles.full}><Notice tone="info">Tu organización quedará pendiente de verificación hasta que un administrador la apruebe.</Notice></div>
        </>}
      </fieldset>}

      <Button type="submit" block loading={submitting} iconEnd={submitting ? undefined : "arrowRight"}>
        {submitting ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>

    <div className={styles.divider}><span>o</span></div>
    <Link href="/login" className={styles.switchCard}>
      <span>¿Ya tienes una cuenta?</span>
      <strong>Iniciar sesión <Icon name="arrowRight" size={18} /></strong>
    </Link>
  </>;
}
