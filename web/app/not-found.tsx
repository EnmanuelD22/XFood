import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import styles from "@/features/auth/AuthPages.module.css";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return <>
    <PublicHeader />
    <main id="contenido">
      <section className={styles.message} aria-labelledby="not-found-title">
        <span className={styles.messageIcon}><Icon name="map" size={32} /></span>
        <h1 id="not-found-title">No encontramos esta página</h1>
        <p>Puede que el enlace haya cambiado o que la página ya no exista.</p>
        <div className={styles.messageActions}>
          <ButtonLink href="/" iconEnd="arrowRight">Volver al inicio</ButtonLink>
          <ButtonLink href="/buscar" variant="secondary">Buscar ofertas</ButtonLink>
        </div>
      </section>
    </main>
  </>;
}
