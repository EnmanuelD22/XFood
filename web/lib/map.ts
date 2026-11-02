/** Map settings shared by the offer search and the establishment location picker. */
export type MapPoint = { latitude: number; longitude: number };

/** Initial view while no location has been shared or picked (Santo Domingo, pilot city). */
export const DEFAULT_MAP_CENTER: MapPoint = { latitude: 18.4861, longitude: -69.9312 };
export const DEFAULT_MAP_ZOOM = 12;
export const MAX_MAP_ZOOM = 19;

export const MAP_TILE_URL =
  process.env.NEXT_PUBLIC_XFOOD_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const MAP_ATTRIBUTION =
  process.env.NEXT_PUBLIC_XFOOD_MAP_ATTRIBUTION
  || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** A cached position avoids asking the device again on every visit within the same minute. */
export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 60_000,
};
