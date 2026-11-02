import type { GeoPoint } from "./types";

export const SEARCH_OPTIONS_PATH = "listings/search-options";

/** Initial view while the consumer has not shared or picked a location. */
export const DEFAULT_MAP_CENTER: GeoPoint = { latitude: 18.4861, longitude: -69.9312 };
export const DEFAULT_MAP_ZOOM = 12;
export const MAX_MAP_ZOOM = 19;
export const MAP_FIT_PADDING = 24;
export const METERS_PER_KM = 1000;

export const MAP_TILE_URL =
  process.env.NEXT_PUBLIC_XFOOD_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const MAP_ATTRIBUTION =
  process.env.NEXT_PUBLIC_XFOOD_MAP_ATTRIBUTION
  || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const RADIUS_STYLE = {
  color: "#214a31",
  weight: 2,
  fillColor: "#c7ea67",
  fillOpacity: 0.16,
};

/** A cached position avoids asking the device again on every visit within the same minute. */
export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 60_000,
};
