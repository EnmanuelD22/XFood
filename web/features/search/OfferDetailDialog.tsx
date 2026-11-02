"use client";

import styles from "@/app/page.module.css";
import searchStyles from "@/app/buscar/page.module.css";
import { formatDate, formatMoney } from "@/features/listings/format";
import { PanelDialog } from "@/features/listings/PanelDialog";
import { discountPercent, formatDistance } from "./format";
import type { ListingSummary } from "./types";

type Props = {
  listing: ListingSummary;
  loading: boolean;
  error: string;
  unavailable: boolean;
  onClose: () => void;
};

export function OfferDetailDialog({ listing, loading, error, unavailable, onClose }: Props) {
  const { establishment } = listing;
  const timeZone = establishment.timeZoneId;
  const discount = discountPercent(listing.originalUnitPrice, listing.discountedUnitPrice);
  const distance = formatDistance(listing.distanceKm);

  return <PanelDialog labelledBy="offer-title" busy={false} onClose={onClose}>
    <header className={styles.modalHeader}><div><span className={styles.eyebrow}>{listing.categoryName.toLocaleUpperCase("es-DO")}</span><h2 id="offer-title">{listing.title}</h2></div>
      <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">×</button></header>
    {loading && <p className={searchStyles.statusLine} role="status">Comprobando disponibilidad…</p>}
    {error && <div className={styles.noticeError} role="alert"><span>!</span><div>{error}</div></div>}
    {!unavailable && <div className={searchStyles.detail}>
      <p className={searchStyles.detailDescription}>{listing.description}</p>
      <section aria-labelledby="offer-establishment"><h3 id="offer-establishment">Establecimiento</h3>
        <p><strong>{establishment.name}</strong><br />{establishment.address}{distance && <><br />A {distance} del punto de búsqueda</>}</p></section>
      <section aria-labelledby="offer-pickup"><h3 id="offer-pickup">Ventana de recogida</h3>
        <p>Desde {formatDate(listing.pickupStartsAtUtc, timeZone)}<br />Hasta {formatDate(listing.pickupDeadlineUtc, timeZone)}<br /><small>Horario del establecimiento ({timeZone})</small></p>
        <p>{listing.pickupInstructions}</p></section>
      <section aria-labelledby="offer-price"><h3 id="offer-price">Precio y disponibilidad</h3>
        <div className={styles.priceLine}><strong>{formatMoney(listing.discountedUnitPrice)}</strong><del>{formatMoney(listing.originalUnitPrice)}</del>
          {discount !== null && <span className={styles.discount}>{discount}% menos</span>}</div>
        <p>{listing.availableQuantity} {listing.availableQuantity === 1 ? "unidad disponible" : "unidades disponibles"}</p>
        {listing.paymentInstructions && <p>Pago: {listing.paymentInstructions}</p>}</section>
      <p className={styles.formFootnote}>La reserva en línea todavía no está disponible.</p>
    </div>}
    <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={onClose}>Cerrar</button></div>
  </PanelDialog>;
}
