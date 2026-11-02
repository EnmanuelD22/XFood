"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_ATTRIBUTION, MAP_TILE_URL, MAX_MAP_ZOOM, type MapPoint } from "@/lib/map";
import styles from "./AuthForm.module.css";

const MARKER_SIZE = 26;
const PICKED_ZOOM = 16;

type Props = {
  point: MapPoint | null;
  invalid: boolean;
  describedBy?: string;
  onPick: (point: MapPoint) => void;
  /** Lets the parent read the map center for the keyboard alternative. */
  onReady: (getCenter: () => MapPoint) => void;
};

/** Leaflet owns the map DOM; React passes the chosen point and receives clicks. */
export function LocationPickerMap({ point, invalid, describedBy, onPick, onReady }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const latest = useRef({ onPick, onReady });

  useEffect(() => {
    latest.current = { onPick, onReady };
  });

  useEffect(() => {
    const instance = L.map(container.current!, {
      center: [DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude],
      zoom: DEFAULT_MAP_ZOOM,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    });
    L.tileLayer(MAP_TILE_URL, { attribution: MAP_ATTRIBUTION, maxZoom: MAX_MAP_ZOOM }).addTo(instance);
    instance.on("click", (event) => {
      const target = event.latlng.wrap();
      latest.current.onPick({ latitude: target.lat, longitude: target.lng });
    });
    map.current = instance;
    latest.current.onReady(() => {
      const center = instance.getCenter().wrap();
      return { latitude: center.lat, longitude: center.lng };
    });
    return () => {
      instance.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    marker.current?.remove();
    marker.current = null;
    if (!point) return;
    const position = L.latLng(point.latitude, point.longitude);
    marker.current = L.marker(position, {
      icon: L.divIcon({ className: styles.pickerMarker, iconSize: [MARKER_SIZE, MARKER_SIZE], iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE] }),
      title: "Ubicación del establecimiento",
      keyboard: false,
      interactive: false,
    }).addTo(instance);
    instance.setView(position, Math.max(instance.getZoom(), PICKED_ZOOM), { animate: false });
  }, [point]);

  return <div ref={container} className={styles.pickerMap} role="region" aria-label="Mapa para ubicar el establecimiento"
    data-invalid={invalid || undefined} aria-describedby={describedBy} />;
}
