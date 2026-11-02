import { formatMoney } from "@/lib/format";
import styles from "./Price.module.css";

/** Discounted price highlighted, original price struck through, as in the approved mock-ups. */
export function Price({ original, discounted, size = "md" }: { original?: number | null; discounted?: number | null; size?: "md" | "lg" }) {
  const percent = original && discounted && discounted < original ? Math.round((1 - discounted / original) * 100) : null;
  return <p className={`${styles.price} ${styles[size]}`}>
    {original != null && <del className={styles.original}><span className="sr-only">Precio original: </span>{formatMoney(original)}</del>}
    <strong className={styles.current}><span className="sr-only">Precio con descuento: </span>{formatMoney(discounted)}</strong>
    {percent !== null && <span className={styles.discount}>{percent}% menos</span>}
  </p>;
}
