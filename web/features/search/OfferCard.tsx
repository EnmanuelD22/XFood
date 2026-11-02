import styles from "@/app/page.module.css";
import searchStyles from "@/app/buscar/page.module.css";
import { formatDate, formatMoney } from "@/features/listings/format";
import { discountPercent, formatDistance } from "./format";
import type { ListingSummary } from "./types";

type Props = {
  listing: ListingSummary;
  onOpen: (listing: ListingSummary) => void;
};

export function OfferCard({ listing, onOpen }: Props) {
  const { establishment } = listing;
  const discount = discountPercent(listing.originalUnitPrice, listing.discountedUnitPrice);
  const distance = formatDistance(listing.distanceKm);

  return <article className={`${styles.listingCard} ${searchStyles.offerCard}`}>
    <div className={styles.listingBody}>
      <span className={searchStyles.offerMeta}>{listing.categoryName}{distance && ` · a ${distance}`}</span>
      <div className={styles.listingTop}><h3>{listing.title}</h3></div>
      <p className={searchStyles.establishmentName}>{establishment.name}</p>
      <div className={styles.priceLine}>
        <strong>{formatMoney(listing.discountedUnitPrice)}</strong><del>{formatMoney(listing.originalUnitPrice)}</del>
        {discount !== null && <span className={styles.discount}>{discount}% menos</span>}
      </div>
      <div className={styles.cardDetails}>
        <span>▦ <b>{listing.availableQuantity}</b> disponibles</span>
        <span>◷ Recogida desde {formatDate(listing.pickupStartsAtUtc, establishment.timeZoneId)}</span>
        <span>Hasta {formatDate(listing.pickupDeadlineUtc, establishment.timeZoneId)}</span>
      </div>
      <div className={styles.cardActions}>
        <button className={styles.editButton} onClick={() => onOpen(listing)} aria-label={`Ver detalle de ${listing.title}`}>Ver detalle</button>
      </div>
    </div>
  </article>;
}
