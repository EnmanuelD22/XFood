"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import searchStyles from "@/app/buscar/page.module.css";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MAP_ATTRIBUTION,
  MAP_FIT_PADDING,
  MAP_TILE_URL,
  MAX_MAP_ZOOM,
  METERS_PER_KM,
  RADIUS_STYLE,
} from "./constants";
import { offerCountLabel } from "./format";
import type { EstablishmentGroup, GeoPoint } from "./types";

const USER_MARKER_SIZE = 20;
const OFFER_MARKER_SIZE = 34;

type Props = {
  point: GeoPoint | null;
  radiusKm: number | null;
  groups: EstablishmentGroup[];
  picking: boolean;
  focusedEstablishmentId: string;
  onPick: (point: GeoPoint) => void;
  onSelectEstablishment: (establishmentId: string) => void;
};

function textElement(text: string) {
  const element = document.createElement("span");
  element.textContent = text;
  return element;
}

/** Leaflet owns the map DOM; React only feeds it the search area and the server results. */
export function SearchMap({ point, radiusKm, groups, picking, focusedEstablishmentId, onPick, onSelectEstablishment }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const areaLayer = useRef<L.LayerGroup | null>(null);
  const offersLayer = useRef<L.LayerGroup | null>(null);
  const latest = useRef({ canPick: picking || !point, onPick, onSelectEstablishment });

  useEffect(() => {
    latest.current = { canPick: picking || !point, onPick, onSelectEstablishment };
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
    areaLayer.current = L.layerGroup().addTo(instance);
    offersLayer.current = L.layerGroup().addTo(instance);
    instance.on("click", (event) => {
      const target = event.latlng.wrap();
      if (latest.current.canPick) latest.current.onPick({ latitude: target.lat, longitude: target.lng });
    });
    map.current = instance;

    return () => {
      instance.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    const layer = areaLayer.current;
    if (!instance || !layer) return;
    layer.clearLayers();
    if (!point) return;

    const center = L.latLng(point.latitude, point.longitude);
    L.marker(center, {
      icon: L.divIcon({ className: searchStyles.userMarker, iconSize: [USER_MARKER_SIZE, USER_MARKER_SIZE] }),
      title: "Punto de búsqueda",
      keyboard: false,
      interactive: false,
    }).addTo(layer);
    if (!radiusKm) {
      instance.setView(center, DEFAULT_MAP_ZOOM, { animate: false });
      return;
    }

    const area = L.circle(center, { ...RADIUS_STYLE, radius: radiusKm * METERS_PER_KM, interactive: false }).addTo(layer);
    instance.fitBounds(area.getBounds(), { padding: [MAP_FIT_PADDING, MAP_FIT_PADDING], animate: false });
  }, [point, radiusKm]);

  useEffect(() => {
    const layer = offersLayer.current;
    if (!layer) return;
    layer.clearLayers();

    for (const { establishment, listings } of groups) {
      const focused = establishment.id === focusedEstablishmentId;
      const label = `${establishment.name}: ${offerCountLabel(listings.length)}`;
      const marker = L.marker([establishment.latitude, establishment.longitude], {
        icon: L.divIcon({
          className: `${searchStyles.offerMarker} ${focused ? searchStyles.offerMarkerFocused : ""}`,
          html: String(listings.length),
          iconSize: [OFFER_MARKER_SIZE, OFFER_MARKER_SIZE],
        }),
        title: label,
        alt: label,
        riseOnHover: true,
        zIndexOffset: focused ? 1000 : 0,
      });
      marker.bindTooltip(textElement(establishment.name), { direction: "top", offset: [0, -OFFER_MARKER_SIZE / 2] });
      marker.on("click", () => latest.current.onSelectEstablishment(establishment.id));
      marker.addTo(layer);
    }
  }, [groups, focusedEstablishmentId]);

  return <div><div ref={container} className={`${searchStyles.map} ${picking || !point ? searchStyles.mapPicking : ""}`}
    role="region" aria-label="Mapa de ofertas cercanas" />
    {(picking || !point) && <div className={searchStyles.keyboardPick}>
      <p>Puedes desplazar el mapa con las flechas del teclado y buscar desde su centro.</p>
      <button type="button" onClick={() => {
        const center = map.current?.getCenter().wrap();
        if (center) onPick({ latitude: center.lat, longitude: center.lng });
      }}>Buscar desde el centro del mapa</button>
    </div>}
  </div>;
}
