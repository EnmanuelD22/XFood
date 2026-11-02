import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/ui/Price";
import { formatDate } from "@/lib/format";
import { formatDistance } from "./format";
import styles from "./search.module.css";
import type { ListingSummary } from "./types";

type Props = {
  listing: ListingSummary;
  onOpen: (listing: ListingSummary) => void;
};

export function OfferCard({ listing, onOpen }: Props) {
  const { establishment } = listing;
  const distance = formatDistance(listing.distanceKm);

  return <article className={styles.card}>
    <div className={styles.cardBody}>
      <p className={styles.cardMeta}>{listing.categoryName}{distance && ` · a ${distance}`}</p>
      <h3 className={styles.cardTitle}>{listing.title}</h3>
      <p className={styles.establishmentName}>{establishment.name}</p>
      <Price original={listing.originalUnitPrice} discounted={listing.discountedUnitPrice} />
      <ul className={styles.facts}>
        <li><Icon name="box" size={16} />{listing.availableQuantity} disponibles</li>
        <li><Icon name="clock" size={16} />Hasta {formatDate(listing.pickupDeadlineUtc, establishment.timeZoneId)}</li>
      </ul>
      <div className={styles.cardActions}>
        <Button variant="secondary" size="sm" iconEnd="arrowRight" onClick={() => onOpen(listing)} aria-label={`Ver detalle de ${listing.title}`}>
          Ver detalle
        </Button>
      </div>
    </div>
  </article>;
}
