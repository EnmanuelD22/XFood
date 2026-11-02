"use client";

import dynamic from "next/dynamic";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { GEOLOCATION_OPTIONS, type MapPoint } from "@/lib/map";
import styles from "./LocationPicker.module.css";

/** Leaflet needs `window`, so the map renders only in the browser. */
const LocationPickerMap = dynamic(() => import("./LocationPickerMap").then((module) => module.LocationPickerMap), {
  ssr: false,
  loading: () => <div className={`${styles.pickerMap} ${styles.pickerLoading}`} role="status">Cargando mapa…</div>,
});

type Props = {
  point: MapPoint | null;
  error?: string;
  disabled?: boolean;
  onChange: (point: MapPoint) => void;
};

/** The API requires real coordinates and never assumes 0,0, so the location is always chosen explicitly. */
export function LocationPicker({ point, error, disabled = false, onChange }: Props) {
  const id = useId();
  const statusId = `${id}-status`;
  const errorId = `${id}-error`;
  const getCenter = useRef<(() => MapPoint) | null>(null);
  const [locating, setLocating] = useState(false);
  const [deviceMessage, setDeviceMessage] = useState("");

  function locateDevice() {
    if (!navigator.geolocation) {
      setDeviceMessage("Tu navegador no permite obtener la ubicación. Marca el punto en el mapa.");
      return;
    }
    setLocating(true);
    setDeviceMessage("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onChange({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      () => {
        setLocating(false);
        setDeviceMessage("No se pudo obtener tu ubicación. Marca el punto en el mapa.");
      },
      GEOLOCATION_OPTIONS,
    );
  }

  return <div className={styles.locationBox}>
    <p className={styles.locationLabel} id={`${id}-label`}>Ubicación del establecimiento<span aria-hidden="true" className={styles.requiredMark}> *</span></p>
    <p className={styles.locationStatus} id={statusId} role="status" data-ready={Boolean(point)}>
      <Icon name={point ? "checkCircle" : "mapPin"} size={18} />
      {point
        ? `Ubicación marcada: ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`
        : "Toca el mapa en el lugar exacto del establecimiento. Los consumidores lo verán en la búsqueda."}
    </p>
    <LocationPickerMap point={point} invalid={Boolean(error)} describedBy={[statusId, error ? errorId : ""].filter(Boolean).join(" ")}
      onPick={(next) => { if (!disabled) onChange(next); }} onReady={(reader) => { getCenter.current = reader; }} />
    <div className={styles.locationActions}>
      <Button variant="secondary" size="sm" icon="locate" onClick={locateDevice} loading={locating} disabled={disabled}>Usar mi ubicación actual</Button>
      <Button variant="ghost" size="sm" icon="mapPin" disabled={disabled} onClick={() => { const center = getCenter.current?.(); if (center) onChange(center); }}>
        Usar el centro del mapa
      </Button>
    </div>
    <p className={styles.locationStatus}>También puedes mover el mapa con las flechas del teclado y elegir «Usar el centro del mapa».</p>
    {deviceMessage && <p className={styles.locationStatus} role="status">{deviceMessage}</p>}
    {error && <p id={errorId} className={styles.locationError}><Icon name="alert" size={16} />{error}</p>}
  </div>;
}
