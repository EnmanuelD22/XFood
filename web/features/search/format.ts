import type { EstablishmentGroup, GeoPoint, ListingSummary } from "./types";

const COORDINATE_DECIMALS = 6;
const GEOLOCATION_PERMISSION_DENIED = 1;
const GEOLOCATION_POSITION_UNAVAILABLE = 2;
const GEOLOCATION_TIMEOUT = 3;

function coordinateParams(point: GeoPoint) {
  return {
    latitude: point.latitude.toFixed(COORDINATE_DECIMALS),
    longitude: point.longitude.toFixed(COORDINATE_DECIMALS),
  };
}

export function buildSearchPath(point: GeoPoint, radiusKm: number, page: number, pageSize: number) {
  const params = new URLSearchParams({
    ...coordinateParams(point),
    radiusKm: String(radiusKm),
    page: String(page),
    pageSize: String(pageSize),
  });
  return `listings?${params}`;
}

export function buildDetailPath(listingId: string, point?: GeoPoint | null) {
  const path = `listings/${encodeURIComponent(listingId)}`;
  return point ? `${path}?${new URLSearchParams(coordinateParams(point))}` : path;
}

export function hasNextPage(headers: Headers) {
  return headers.get("X-Has-Next-Page")?.toLowerCase() === "true";
}

/** Offers can change between pages, so a later page may repeat an id already shown. */
export function mergeById(current: ListingSummary[], incoming: ListingSummary[]) {
  const merged = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) merged.set(item.id, item);
  return [...merged.values()];
}

export function groupByEstablishment(listings: ListingSummary[]): EstablishmentGroup[] {
  const groups = new Map<string, EstablishmentGroup>();
  for (const listing of listings) {
    const group = groups.get(listing.establishment.id);
    if (group) group.listings.push(listing);
    else groups.set(listing.establishment.id, { establishment: listing.establishment, listings: [listing] });
  }
  return [...groups.values()];
}

export function formatDistance(distanceKm?: number | null) {
  if (distanceKm == null) return "";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;

  return `${new Intl.NumberFormat("es-DO", { maximumFractionDigits: 1 }).format(distanceKm)} km`;
}

export function discountPercent(original?: number | null, discounted?: number | null) {
  if (!original || !discounted || discounted >= original) return null;
  return Math.round((1 - discounted / original) * 100);
}

export function offerCountLabel(count: number) {
  return count === 1 ? "1 oferta" : `${count} ofertas`;
}

export function locationErrorMessage(code?: number) {
  if (code === GEOLOCATION_PERMISSION_DENIED) {
    return "No diste permiso para usar tu ubicación. Elige un punto en el mapa para buscar ofertas cercanas.";
  }
  if (code === GEOLOCATION_POSITION_UNAVAILABLE || code === GEOLOCATION_TIMEOUT) {
    return "No pudimos obtener tu ubicación. Elige un punto en el mapa para continuar.";
  }
  return "Tu navegador no permite compartir la ubicación. Elige un punto en el mapa para continuar.";
}

/** Identifies one search; a result whose key differs from the current one is stale. */
export function searchKey(point: GeoPoint, radiusKm: number, attempt: number) {
  const { latitude, longitude } = coordinateParams(point);
  return `${latitude},${longitude}|${radiusKm}|${attempt}`;
}
