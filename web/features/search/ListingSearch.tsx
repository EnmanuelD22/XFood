"use client";

import dynamic from "next/dynamic";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SelectField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { OfferCard } from "./OfferCard";
import { OfferDetailDialog } from "./OfferDetailDialog";
import { offerCountLabel } from "./format";
import styles from "./search.module.css";
import { useListingSearch } from "./use-listing-search";

/** Leaflet needs `window`, so the map renders only in the browser. */
const SearchMap = dynamic(() => import("./SearchMap").then((module) => module.SearchMap), {
  ssr: false,
  loading: () => <div className={`${styles.map} ${styles.mapLoading}`} role="status">Cargando mapa…</div>,
});

export function ListingSearch() {
  const { state, actions } = useListingSearch();
  const { detailError, detailLoading, detailUnavailable, focusedGroup, groups, hasMore, loadingMore, location, locationNotice,
    moreError, options, optionsError, picking, point, radiusKm, results, selected, status, visibleResults } = state;
  const { changeRadius, clearFocus, closeDetail, focusEstablishment, loadMore, locate, openDetail, pickPoint, refresh,
    setPicking } = actions;

  return <>
    <a className="skip-link" href="#resultados">Ir a resultados</a>
    <PublicHeader current="/buscar" />
    <main className={styles.content}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Comida a bajo costo</p>
        <h1 className={styles.title}>Ofertas cerca de ti</h1>
        <p className={styles.subtitle}>Encuentra excedentes de alimentos disponibles a precio reducido y sus condiciones de recogida.</p>
      </div>

      <div className={styles.toolbar}>
        <p className={styles.location} role="status">
          <span className={styles.locationIcon}><Icon name="mapPin" /></span>{locationLabel(location, picking)}
        </p>
        <div className={styles.controls}>
          <SelectField label="Radio de búsqueda" className={styles.radius} value={radiusKm ?? ""} disabled={!options}
            onChange={(event) => changeRadius(Number(event.target.value))}>
            {!options && <option value="">—</option>}
            {options?.radiiKm.map((value) => <option key={value} value={value}>{value} km</option>)}
          </SelectField>
          <Button variant="secondary" icon="locate" onClick={() => void locate()} disabled={location.kind === "locating"}>Usar mi ubicación</Button>
          <Button variant="secondary" icon="map" onClick={() => setPicking(!picking)} aria-pressed={picking}>
            {picking ? "Cancelar selección" : "Elegir en el mapa"}
          </Button>
          <Button icon="refresh" onClick={refresh} disabled={!point || !options || status === "loading"}>Actualizar ofertas</Button>
        </div>
      </div>

      {(optionsError || (locationNotice && location.kind === "ready")) && <div className={styles.notices}>
        {optionsError && <Notice tone="error" action={{ label: "Volver a intentar", onClick: refresh }}>
          No se pudo cargar la configuración de búsqueda: {optionsError}
        </Notice>}
        {locationNotice && location.kind === "ready" && <Notice tone="warning">{locationNotice}</Notice>}
      </div>}

      <div className={styles.layout}>
        <section className={styles.mapPanel} aria-label="Mapa">
          <SearchMap point={point} radiusKm={radiusKm} groups={groups} picking={picking}
            focusedEstablishmentId={focusedGroup?.establishment.id ?? ""} onPick={pickPoint} onSelectEstablishment={focusEstablishment} />
          {(picking || location.kind === "manual") && <p className={styles.mapHint}><Icon name="locate" size={18} />Toca el mapa para elegir el punto de búsqueda.</p>}
        </section>

        <section id="resultados" aria-labelledby="results-title" aria-busy={status === "loading"}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 id="results-title" className={styles.resultsTitle}>{resultsTitle(status, results.length, hasMore)}</h2>
              <p className={styles.resultsCaption}>{radiusKm ? `Dentro de ${radiusKm} km del punto de búsqueda` : "Elige una ubicación para buscar"}</p>
            </div>
          </div>
          {focusedGroup && <div className={styles.focusChip}>
            <span>Ofertas de <strong>{focusedGroup.establishment.name}</strong></span>
            <Button variant="ghost" size="sm" onClick={clearFocus}>Ver todas</Button>
          </div>}
          <SearchResults state={state} onOpen={(listing) => void openDetail(listing)} onRetry={refresh} />
          {moreError && status === "ready" && <Notice tone="error" className={styles.loadMore} action={{ label: "Volver a intentar", onClick: () => void loadMore() }}>{moreError}</Notice>}
          {status === "ready" && hasMore && <Button variant="secondary" block className={styles.loadMore} onClick={() => void loadMore()} loading={loadingMore}>
            {loadingMore ? "Cargando…" : "Cargar más ofertas"}
          </Button>}
          {visibleResults.length > 0 && <p className={styles.statusLine}>Mostrando {offerCountLabel(visibleResults.length)}.</p>}
        </section>
      </div>
    </main>
    <SiteFooter />
    {selected && <OfferDetailDialog listing={selected} loading={detailLoading} error={detailError} unavailable={detailUnavailable} onClose={closeDetail} />}
  </>;
}

type SearchState = ReturnType<typeof useListingSearch>["state"];

function SearchResults({ state, onOpen, onRetry }: { state: SearchState; onOpen: Parameters<typeof OfferCard>[0]["onOpen"]; onRetry: () => void }) {
  const { location, options, optionsError, radiusKm, searchError, status, visibleResults } = state;
  const retry = <Button variant="secondary" icon="refresh" onClick={onRetry}>Volver a intentar</Button>;
  if (location.kind === "manual") {
    return <EmptyState icon="locate" title="Elige un punto en el mapa">{location.message}</EmptyState>;
  }
  if (optionsError && !options) {
    return <EmptyState icon="alert" title="No pudimos preparar la búsqueda" action={retry}>Revisa la conexión e inténtalo de nuevo.</EmptyState>;
  }
  if (location.kind === "locating" || status === "idle" || status === "loading") {
    return <SkeletonCards className={styles.offerList} label="Cargando ofertas" media={false} />;
  }
  if (status === "error") {
    return <EmptyState icon="alert" title="No pudimos cargar las ofertas" action={retry}>{searchError || "Revisa la conexión e inténtalo de nuevo."}</EmptyState>;
  }
  if (!visibleResults.length) {
    return <EmptyState icon="search" title="No hay ofertas en este radio">
      {radiusKm === options?.radiiKm.at(-1) ? "Prueba con otro punto del mapa o vuelve más tarde." : "Prueba con un radio mayor o con otro punto del mapa."}
    </EmptyState>;
  }
  return <div className={styles.offerList}>{visibleResults.map((listing, index) => <OfferCard key={listing.id} listing={listing} priority={index < 2} onOpen={onOpen} />)}</div>;
}

function locationLabel(location: SearchState["location"], picking: boolean) {
  if (picking) return "Selecciona un punto en el mapa.";
  if (location.kind === "locating") return "Obteniendo tu ubicación…";
  if (location.kind === "manual") return "Ubicación no disponible: elige un punto en el mapa.";
  return location.source === "device" ? "Buscando cerca de tu ubicación actual." : "Buscando cerca del punto elegido en el mapa.";
}

function resultsTitle(status: SearchState["status"], count: number, hasMore: boolean) {
  if (status !== "ready") return "Ofertas disponibles";
  if (!count) return "Sin ofertas cercanas";
  return hasMore ? `${offerCountLabel(count)} cargadas` : offerCountLabel(count);
}
