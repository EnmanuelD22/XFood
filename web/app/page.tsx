import { PublicHeader } from "@/components/layout/PublicHeader";
import { ButtonLink } from "@/components/ui/Button";
import styles from "@/features/auth/AuthPages.module.css";

export default function HomePage() {
  return <>
    <PublicHeader current="/" />
    <main id="contenido">
      <section className={styles.message} aria-labelledby="home-title">
        <h1 id="home-title">Buena comida también puede tener un mejor mañana</h1>
        <p>Aprovechemos los alimentos juntos.</p>
        <div className={styles.messageActions}>
          <ButtonLink href="/buscar" iconEnd="arrowRight">Buscar ofertas</ButtonLink>
          <ButtonLink href="/panel" variant="secondary">Panel del establecimiento</ButtonLink>
        </div>
      </section>
    </main>
  </>;
}
