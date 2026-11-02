"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageStatus } from "@/components/layout/PageStatus";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { ApiRequestError, isApiError } from "@/lib/api";
import { login } from "./api";
import { postLoginPath } from "./routing";
import { useSession } from "./SessionProvider";
import styles from "./AuthForm.module.css";

type Errors = { email?: string; password?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Text for every documented login failure of `POST /auth/login` and the session check that follows. */
function loginErrorMessage(error: unknown) {
  if (isApiError(error, 401, "INVALID_CREDENTIALS")) {
    return "El correo o la contraseña no son correctos. Después de cinco intentos fallidos la cuenta se bloquea temporalmente.";
  }
  if (isApiError(error, 403, "ACCOUNT_SUSPENDED")) return "Tu cuenta está suspendida. Escribe al equipo de XFood para revisarla.";
  if (isApiError(error, 403)) return "La API rechazó el origen de esta página. Abre el panel desde la dirección configurada para XFood.";
  if (error instanceof ApiRequestError) return error.message;
  return "No se pudo conectar con XFood. Revisa tu conexión e inténtalo de nuevo.";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const { session, confirm } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const emailInput = useRef<HTMLInputElement>(null);

  // Someone who already has a session does not need the form.
  useEffect(() => {
    if (session.status === "authenticated" && !submitting) router.replace(postLoginPath(session.account, next));
  }, [next, router, session, submitting]);

  function validate(): Errors {
    const result: Errors = {};
    if (!EMAIL_PATTERN.test(email.trim())) result.email = "Escribe un correo electrónico válido.";
    if (!password) result.password = "Escribe tu contraseña.";
    return result;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const found = validate();
    setErrors(found);
    setFormError("");
    if (found.email || found.password) {
      (found.email ? emailInput.current : event.currentTarget.querySelector<HTMLInputElement>("input[type=password]"))?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (error) {
      setSubmitting(false);
      setPassword("");
      const fields = error instanceof ApiRequestError ? error.payload.errors : undefined;
      if (fields?.Email || fields?.email || fields?.Password || fields?.password) {
        setErrors({ email: (fields.Email ?? fields.email)?.[0], password: (fields.Password ?? fields.password)?.[0] });
      }
      setFormError(loginErrorMessage(error));
      return;
    }

    try {
      // The decision is taken with GET /me, which also proves that the browser stored the session cookie.
      const account = await confirm();
      router.replace(postLoginPath(account, next));
    } catch (error) {
      setSubmitting(false);
      setFormError(isApiError(error, 401)
        ? "La API aceptó tus datos, pero el navegador no guardó la cookie de sesión. Abre XFood con HTTPS (npm run dev -- --experimental-https) e inténtalo de nuevo."
        : loginErrorMessage(error));
    }
  }

  if (session.status === "authenticated" && !submitting) return <PageStatus label="Ya iniciaste sesión. Redirigiendo…" />;

  return <>
    <header className={styles.header}>
      <h1 className={styles.title}>Bienvenido a XFood</h1>
      <p className={styles.subtitle}>Aprovechemos los alimentos juntos.</p>
    </header>

    <div className={styles.notices}>
      {params.get("registro") === "ok" && <Notice tone="success" title="Cuenta creada">Inicia sesión con tu correo y contraseña para continuar.</Notice>}
      {params.get("sesion") === "cerrada" && <Notice tone="info">Cerraste sesión correctamente.</Notice>}
      {next && session.status === "anonymous" && !params.get("sesion") && <Notice tone="info">Inicia sesión para continuar.</Notice>}
      {formError && <Notice tone="error">{formError}</Notice>}
    </div>

    <form className={styles.form} onSubmit={submit} noValidate>
      <TextField ref={emailInput} label="Correo electrónico" type="email" name="email" icon="mail" autoComplete="email" required
        placeholder="Tu correo electrónico" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} disabled={submitting} />
      <TextField label="Contraseña" type="password" name="password" icon="lock" autoComplete="current-password" required revealable
        placeholder="Tu contraseña" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} disabled={submitting} />
      <Button type="submit" block loading={submitting} iconEnd={submitting ? undefined : "arrowRight"}>
        {submitting ? "Iniciando sesión…" : "Iniciar sesión"}
      </Button>
    </form>

    <div className={styles.divider}><span>o</span></div>
    <Link href="/registro" className={styles.switchCard}>
      <span>¿Aún no tienes una cuenta?</span>
      <strong>Crear cuenta <Icon name="arrowRight" size={18} /></strong>
    </Link>
  </>;
}
