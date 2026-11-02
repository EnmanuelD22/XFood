"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { SIGNED_OUT_PATH } from "@/features/auth/routing";
import { useSession } from "@/features/auth/SessionProvider";
import { LocationPicker } from "@/features/location/LocationPicker";
import { activeEstablishments, pickEstablishment } from "@/features/panel/establishments";
import { usePanelAccount } from "@/features/panel/use-panel-account";
import { apiRequest, ApiRequestError, isApiError } from "@/lib/api";
import {
  normalizeProfileErrors,
  toProfileForm,
  toProfileRequest,
  validateProfile,
  type EstablishmentProfile,
  type ProfileErrors,
  type ProfileForm,
} from "./profile";
import styles from "./Settings.module.css";

type Loaded = { forId: string; profile?: EstablishmentProfile; error?: string };

export function EstablishmentSettings() {
  const account = usePanelAccount();
  const router = useRouter();
  const { confirm, signOut } = useSession();
  const establishments = activeEstablishments(account);
  const [establishmentId, setEstablishmentId] = useState(
    () => pickEstablishment(account, new URLSearchParams(window.location.search).get("establishmentId"))?.id ?? "",
  );
  const [loaded, setLoaded] = useState<Loaded>({ forId: "" });
  const [attempt, setAttempt] = useState(0);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const loading = Boolean(establishmentId) && loaded.forId !== `${establishmentId}#${attempt}`;
  const error = (key: string) => errors[key]?.[0];

  useEffect(() => {
    if (!establishmentId) return;
    const controller = new AbortController();
    const key = `${establishmentId}#${attempt}`;
    apiRequest<EstablishmentProfile>(`establishments/${encodeURIComponent(establishmentId)}`, { signal: controller.signal }).then(
      (profile) => {
        setLoaded({ forId: key, profile });
        setForm(toProfileForm(profile));
      },
      (reason: unknown) => {
        if (controller.signal.aborted) return;
        setLoaded({ forId: key, error: (reason as Error).message || "No se pudo cargar el perfil." });
      },
    );
    return () => controller.abort();
  }, [establishmentId, attempt]);

  function choose(id: string) {
    setEstablishmentId(id);
    setForm(null);
    setErrors({});
    setFormError("");
    setSuccess("");
    const url = new URL(window.location.href);
    url.searchParams.set("establishmentId", id);
    window.history.replaceState({}, "", url);
  }

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => current && { ...current, [key]: value });
    setSuccess("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || saving) return;
    const found = validateProfile(form);
    setErrors(found);
    setFormError("");
    setSuccess("");
    if (Object.keys(found).length) {
      setFormError("Revisa los campos marcados.");
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setSaving(true);
    try {
      const profile = await apiRequest<EstablishmentProfile>(`establishments/${encodeURIComponent(establishmentId)}`, {
        method: "PUT",
        body: JSON.stringify(toProfileRequest(form)),
      });
      setLoaded((current) => ({ ...current, profile }));
      setForm(toProfileForm(profile));
      setSuccess("Los datos del establecimiento se guardaron.");
      // The establishment name also appears in the session; refresh it without leaving the page.
      void confirm().catch(() => undefined);
    } catch (reason) {
      if (isApiError(reason, 400)) {
        setErrors(normalizeProfileErrors(reason.payload.errors));
        setFormError(reason.message || "Revisa los campos marcados.");
      } else if (isApiError(reason, 409)) {
        setFormError("Otra persona actualizó el perfil mientras lo editabas. Cargamos los datos más recientes; revisa y vuelve a guardar.");
        setAttempt((value) => value + 1);
      } else if (isApiError(reason, 403)) {
        setFormError("Tu cuenta no tiene permiso para modificar este establecimiento.");
      } else {
        setFormError(reason instanceof ApiRequestError ? reason.message : "No se pudo conectar con XFood.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function leave() {
    setLeaving(true);
    try {
      await signOut();
      router.replace(SIGNED_OUT_PATH);
    } catch (reason) {
      setLeaving(false);
      setFormError((reason as Error).message || "No se pudo cerrar la sesión.");
    }
  }

  return <div className={styles.page}>
    <header className={styles.header}>
      <p className={styles.eyebrow}>Establecimiento</p>
      <h1 className={styles.title}>Configuración</h1>
      <p className={styles.subtitle}>Datos que verán los consumidores y ubicación para la búsqueda cercana.</p>
    </header>

    {establishments.length > 1 && <SelectField label="Establecimiento" className={styles.picker} value={establishmentId} disabled={saving}
      onChange={(event) => choose(event.target.value)}>
      <option value="" disabled>Selecciona el establecimiento</option>
      {establishments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
    </SelectField>}

    <div className={styles.layout}>
      <section className={styles.card} aria-labelledby="profile-title">
        <h2 id="profile-title" className={styles.cardTitle}><Icon name="store" size={22} />Perfil del establecimiento</h2>
        {!establishmentId ? <p className={styles.muted}>Selecciona un establecimiento para ver sus datos.</p>
          : loading ? <p className={styles.muted} role="status">Cargando datos del establecimiento…</p>
          : loaded.error ? <Notice tone="error" action={{ label: "Volver a intentar", onClick: () => setAttempt((value) => value + 1) }}>{loaded.error}</Notice>
          : form && <form ref={formRef} className={styles.form} onSubmit={save} noValidate>
            {formError && <Notice tone="error">{formError}</Notice>}
            {success && <Notice tone="success">{success}</Notice>}
            <fieldset className={styles.fields} disabled={saving}>
              <legend className="sr-only">Datos del establecimiento</legend>
              <TextField className={styles.full} label="Nombre del establecimiento" icon="store" required maxLength={200}
                value={form.name} onChange={(event) => update("name", event.target.value)} error={error("name")} />
              <TextField label="Persona de contacto" icon="user" required maxLength={200} autoComplete="name"
                value={form.contactName} onChange={(event) => update("contactName", event.target.value)} error={error("contactName")} />
              <TextField label="Teléfono de contacto" type="tel" icon="phone" required maxLength={32} autoComplete="tel"
                value={form.contactPhone} onChange={(event) => update("contactPhone", event.target.value)} error={error("contactPhone")} />
              <TextField className={styles.full} label="Correo de contacto" type="email" icon="mail" required maxLength={320} autoComplete="email"
                value={form.contactEmail} onChange={(event) => update("contactEmail", event.target.value)} error={error("contactEmail")} />
              <TextField className={styles.full} label="Dirección" icon="mapPin" required maxLength={500} autoComplete="street-address"
                value={form.address} onChange={(event) => update("address", event.target.value)} error={error("address")} />
              <div className={styles.full}>
                <LocationPicker point={{ latitude: form.latitude, longitude: form.longitude }} error={error("location")} disabled={saving}
                  onChange={(point) => setForm((current) => current && { ...current, ...point })} />
              </div>
            </fieldset>
            <p className={styles.muted}>Zona horaria de las publicaciones: <strong>{loaded.profile?.timeZoneId}</strong>. Se configura al crear la cuenta.</p>
            <div className={styles.actions}>
              <Button variant="secondary" disabled={saving} onClick={() => { if (loaded.profile) setForm(toProfileForm(loaded.profile)); setErrors({}); setFormError(""); }}>
                Descartar cambios
              </Button>
              <Button type="submit" icon="check" loading={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
            </div>
          </form>}
      </section>

      <aside className={styles.card} aria-labelledby="account-title">
        <h2 id="account-title" className={styles.cardTitle}><Icon name="user" size={22} />Tu cuenta</h2>
        <dl className={styles.account}>
          <div><dt>Nombre</dt><dd>{account.displayName ?? "—"}</dd></div>
          <div><dt>Correo</dt><dd>{account.email ?? "—"}</dd></div>
          <div><dt>Rol</dt><dd>Establecimiento</dd></div>
        </dl>
        <p className={styles.muted}>Al cerrar sesión se cierran también las sesiones abiertas en otros navegadores.</p>
        <Button variant="secondary" icon="logout" onClick={() => void leave()} loading={leaving}>Cerrar sesión</Button>
      </aside>
    </div>
  </div>;
}
