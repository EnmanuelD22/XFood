import { ActionMenu, type ActionMenuItem } from "@/components/ui/ActionMenu";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/ui/Price";
import { StatusPill, type StatusTone } from "@/components/ui/StatusPill";
import { CategoryImage } from "@/features/categories/CategoryImage";
import { formatDate, formatShortDateTime } from "@/lib/format";
import { getListingStatus } from "./format";
import styles from "./panel.module.css";
import type { Category, Listing, VisibilityCheck } from "./types";

const STATUS_TONES: Record<string, StatusTone> = {
  Activa: "success",
  Agotada: "warning",
  Desactivada: "neutral",
  Vencida: "error",
};

type Props = {
  listing: Listing;
  categories: Category[];
  timeZone: string;
  visibility?: VisibilityCheck;
  checking: boolean;
  /** Only the first row loads its images eagerly. */
  priority?: boolean;
  onEdit: (listing: Listing) => void;
  onDeactivate: (listing: Listing) => void;
  onCheckVisibility: (listing: Listing) => void;
};

export function ListingCard({ listing, categories, timeZone, visibility, checking, priority = false, onEdit, onDeactivate, onCheckVisibility }: Props) {
  const status = getListingStatus(listing.status, listing.pickupDeadlineUtc);
  const open = status === "Activa" || status === "Agotada";
  const isSale = listing.mode === 1;
  const activeSale = isSale && status === "Activa" && listing.availableQuantity > 0 && listing.isFoodFit;
  const categoryName = categories.find((item) => item.id === listing.categoryId)?.name;
  const titleId = `listing-${listing.id}`;

  const actions: ActionMenuItem[] = [];
  if (activeSale) actions.push({ label: checking ? "Comprobando búsqueda…" : "Comprobar en búsqueda pública", icon: "search", disabled: checking, onSelect: () => onCheckVisibility(listing) });
  if (open) actions.push({ label: "Desactivar", icon: "power", tone: "danger", onSelect: () => onDeactivate(listing) });

  return <article className={styles.card} aria-labelledby={titleId}>
    <div className={styles.cardMedia}>
      <CategoryImage categoryId={listing.categoryId} categoryName={categoryName} priority={priority} />
      <StatusPill tone={STATUS_TONES[status] ?? "neutral"} className={styles.cardStatus}>{status}</StatusPill>
    </div>
    <div className={styles.cardBody}>
      <div>
        <h3 id={titleId} className={styles.cardTitle}>{listing.title}</h3>
        <p className={styles.cardCategory}>{categoryName ?? "Categoría"} · {isSale ? "Venta" : "Donación"}</p>
      </div>
      {isSale ? <Price original={listing.originalUnitPrice} discounted={listing.discountedUnitPrice} /> : <p className={styles.donation}>Donación</p>}
      <ul className={styles.facts}>
        <li><Icon name="box" size={18} /><span><b>{listing.availableQuantity}</b> {listing.availableQuantity === 1 ? "disponible" : "disponibles"}</span></li>
        <li title={`Recogida desde ${formatDate(listing.pickupStartsAtUtc, timeZone)} hasta ${formatDate(listing.pickupDeadlineUtc, timeZone)}`}>
          <Icon name="clock" size={18} />
          <span>Hasta <time dateTime={listing.pickupDeadlineUtc}>{formatShortDateTime(listing.pickupDeadlineUtc, timeZone)}</time></span>
        </li>
      </ul>
      {open ? <div className={styles.cardActions}>
        {isSale && <Button variant="soft" icon="edit" className={styles.editButton} onClick={() => onEdit(listing)}>Editar</Button>}
        {actions.length > 0 && <ActionMenu label={`Más acciones para ${listing.title}`} items={actions} />}
      </div> : <p className={styles.closed}>Publicación cerrada. Se conserva en tu historial.</p>}
      {visibility && <p className={`${styles.visibility} ${styles[`visibility-${visibility.kind}`]}`} role="status">
        <Icon name={visibility.kind === "success" ? "checkCircle" : "info"} size={16} />{visibility.message}
      </p>}
    </div>
  </article>;
}
