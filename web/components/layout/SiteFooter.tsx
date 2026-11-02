import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.brand}>
        <Brand tone="light" />
        <p>Aprovechemos los alimentos juntos.</p>
      </div>
      <nav aria-label="Pie de página">
        <ul className={styles.links}>
          <li><Link href="/buscar">Buscar ofertas</Link></li>
          <li><Link href="/registro?rol=establecimiento">Publicar excedentes</Link></li>
          <li><Link href="/registro">Crear cuenta</Link></li>
          <li><Link href="/login">Iniciar sesión</Link></li>
        </ul>
      </nav>
      <p className={styles.note}>Las imágenes de categoría son ilustrativas y no muestran el producto real de cada publicación.</p>
    </div>
  </footer>;
}
