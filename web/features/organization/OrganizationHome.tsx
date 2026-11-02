"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { StatusPill, type StatusTone } from "@/components/ui/StatusPill";
import { RequireRole } from "@/features/auth/RequireRole";
import type { Account } from "@/features/auth/types";
import styles from "./OrganizationHome.module.css";

const STATUS: Record<string, { label: string; tone: StatusTone; text: string }> = {
  Pending: {
    label: "Pendiente de verificación",
    tone: "warning",
    text: "Un administrador de XFood está revisando la información de tu organización. Te avisaremos cuando termine la revisión.",
  },
  Approved: {
    label: "Verificada",
    tone: "success",
    text: "Tu organización está verificada. La gestión de donaciones desde la web se habilitará en una próxima entrega.",
  },
  Rejected: {
    label: "Solicitud rechazada",
    tone: "error",
    text: "La verificación no fue aprobada. Escribe al equipo de XFood para conocer el motivo y volver a intentarlo.",
  },
  Suspended: {
    label: "Suspendida",
    tone: "error",
    text: "La organización está suspendida temporalmente. Escribe al equipo de XFood para revisarlo.",
  },
};

export function OrganizationHome() {
  return <RequireRole role="Organization">{(account) => <Content account={account} />}</RequireRole>;
}

function Content({ account }: { account: Account }) {
  const organization = account.organization;
  const status = STATUS[organization?.verificationStatus ?? ""] ?? {
    label: organization?.verificationStatus ?? "Sin información",
    tone: "neutral" as const,
    text: "No pudimos interpretar el estado de verificación. Escribe al equipo de XFood si necesitas ayuda.",
  };

  return <main id="contenido" className={styles.page}>
    <p className={styles.eyebrow}>Organización beneficiaria</p>
    <h1 className={styles.title}>Hola, {account.displayName ?? "equipo"}</h1>
    <section className={styles.card} aria-labelledby="organization-name">
      <span className={styles.icon}><Icon name="heart" size={28} /></span>
      <div className={styles.cardBody}>
        <h2 id="organization-name">{organization?.name ?? "Tu organización"}</h2>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
        <p>{status.text}</p>
      </div>
    </section>
    <Notice tone="info" title="¿Qué puedes hacer mientras tanto?">
      Puedes consultar las ofertas cercanas para conocer los establecimientos que participan en XFood.
    </Notice>
    <div className={styles.actions}>
      <ButtonLink href="/buscar" icon="search">Ver ofertas cercanas</ButtonLink>
    </div>
  </main>;
}
