import styles from "@/app/page.module.css";
import { formatDate, formatMoney, getListingStatus } from "./format";
import type { Category, Listing, VisibilityCheck } from "./types";

type Props = {
  listing: Listing;
  categories: Category[];
  timeZone: string;
  visibility?: VisibilityCheck;
  checking: boolean;
  onEdit: (listing: Listing) => void;
  onDeactivate: (listing: Listing) => void;
  onCheckVisibility: (listing: Listing) => void;
};

export function ListingCard({ listing, categories, timeZone, visibility, checking, onEdit, onDeactivate, onCheckVisibility }: Props) {
  const status = getListingStatus(listing.status, listing.pickupDeadlineUtc);
  const statusClass = styles[`status${status === "Vencida" ? 4 : listing.status}`] ?? "";
  const visibilityClass = visibility?.kind === "success" ? styles.visibilitySuccess
    : visibility?.kind === "missing" ? styles.visibilityMissing
      : styles.visibilityError;
  const category = categories.find((item) => item.id === listing.categoryId)?.name ?? "Excedente";
  const activeSale = listing.mode === 1 && getListingStatus(listing.status, listing.pickupDeadlineUtc) === "Activa" && listing.availableQuantity > 0 && listing.isFoodFit;

  return <article className={styles.listingCard}>
    <div className={styles.foodVisual}>
      <div className={styles.foodShape} aria-hidden="true">◇</div>
      <span className={styles.categoryPill}>{category} · {listing.mode === 2 ? "Donación" : "Venta"}</span>
      <span className={`${styles.statusPill} ${statusClass}`}>{status}</span>
    </div>
    <div className={styles.listingBody}>
      <div className={styles.listingTop}><h3>{listing.title}</h3></div>
      <p className={styles.description}>{listing.description}</p>
      {listing.mode === 2 ? <div className={styles.priceLine}><strong>Donación</strong></div> : <div className={styles.priceLine}>
        <strong>{formatMoney(listing.discountedUnitPrice)}</strong><del>{formatMoney(listing.originalUnitPrice)}</del>
        <span className={styles.discount}>{listing.originalUnitPrice && listing.discountedUnitPrice ? `${Math.round((1 - listing.discountedUnitPrice / listing.originalUnitPrice) * 100)}% menos` : ""}</span>
      </div>}
      <div className={styles.cardDetails}><span>▦ <b>{listing.availableQuantity}</b> disponibles</span><span>◷ Recogida desde {formatDate(listing.pickupStartsAtUtc, timeZone)}</span><span>Hasta {formatDate(listing.pickupDeadlineUtc, timeZone)}</span></div>
      <div className={styles.cardActions}>
        {listing.mode === 1 && (status === "Activa" || status === "Agotada") && <button className={styles.editButton} onClick={() => onEdit(listing)}>Editar</button>}
        {(status === "Activa" || status === "Agotada") && <button className={styles.deactivateButton} onClick={() => onDeactivate(listing)}>Desactivar</button>}
      </div>
      {activeSale && <div className={styles.visibilityCheck}>
        <button className={styles.visibilityButton} onClick={() => onCheckVisibility(listing)} disabled={checking}>{checking ? "Comprobando búsqueda…" : "Comprobar en búsqueda pública"}</button>
        {visibility && <p className={`${styles.visibilityResult} ${visibilityClass}`} role="status">{visibility.message}</p>}
      </div>}
    </div>
  </article>;
}
