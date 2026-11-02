import type { Listing } from "@/features/listings/types";

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

/** Public establishment data the API returns with each offer; it never includes contact data. */
export type OfferEstablishment = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timeZoneId: string;
};

/** Same response for the list, the map and the detail (`GET /listings` and `GET /listings/{id}`). */
export type ListingSummary = Listing & {
  categoryName: string;
  establishment: OfferEstablishment;
  distanceKm?: number | null;
};

export type EstablishmentGroup = {
  establishment: OfferEstablishment;
  listings: ListingSummary[];
};

export type LocationSource = "device" | "manual";

export type LocationState =
  | { kind: "locating" }
  | { kind: "manual"; message: string }
  | { kind: "ready"; point: GeoPoint; source: LocationSource };

export type SearchStatus = "idle" | "loading" | "ready" | "error";
