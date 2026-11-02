"use client";

import { Button } from "@/components/ui/Button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/ui/Dialog";
import { Notice } from "@/components/ui/Notice";
import { Price } from "@/components/ui/Price";
import { CategoryImage } from "@/features/categories/CategoryImage";
import { formatDate } from "@/lib/format";
import { formatDistance } from "./format";
import styles from "./search.module.css";
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
  const distance = formatDistance(listing.distanceKm);

  return <Dialog labelledBy="offer-title" onClose={onClose}>
    <DialogHeader titleId="offer-title" eyebrow={listing.categoryName} title={listing.title} onClose={onClose} />
    <DialogBody>
      {loading && <p className={styles.muted} role="status">Comprobando disponibilidad…</p>}
      {error && <Notice tone="error">{error}</Notice>}
      {!loading && !error && !unavailable && <div className={styles.detail}>
        <CategoryImage className={styles.detailMedia} categoryId={listing.categoryId} categoryName={listing.categoryName} priority />
        <p className={styles.detailDescription}>{listing.description}</p>
        <section className={styles.detailSection} aria-labelledby="offer-price">
          <h3 id="offer-price">Precio y disponibilidad</h3>
          <Price original={listing.originalUnitPrice} discounted={listing.discountedUnitPrice} size="lg" />
          <p>{listing.availableQuantity} {listing.availableQuantity === 1 ? "unidad disponible" : "unidades disponibles"}</p>
          {listing.paymentInstructions && <p>Pago: {listing.paymentInstructions}</p>}
        </section>
        <section className={styles.detailSection} aria-labelledby="offer-establishment">
          <h3 id="offer-establishment">Establecimiento</h3>
          <p><strong>{establishment.name}</strong></p>
          <p>{establishment.address}</p>
          {distance && <p className={styles.muted}>A {distance} del punto de búsqueda</p>}
        </section>
        <section className={styles.detailSection} aria-labelledby="offer-pickup">
          <h3 id="offer-pickup">Ventana de recogida</h3>
          <p>Desde {formatDate(listing.pickupStartsAtUtc, timeZone)}</p>
          <p>Hasta {formatDate(listing.pickupDeadlineUtc, timeZone)}</p>
          <p className={styles.muted}>Horario del establecimiento ({timeZone})</p>
          <p>{listing.pickupInstructions}</p>
        </section>
        <Notice tone="info">La reserva en línea todavía no está disponible.</Notice>
      </div>}
    </DialogBody>
    <DialogActions><Button variant="secondary" onClick={onClose}>Cerrar</Button></DialogActions>
  </Dialog>;
}
