"use client";

import dynamic from "next/dynamic";
import styles from "@/app/page.module.css";
import searchStyles from "@/app/buscar/page.module.css";
import { OfferCard } from "./OfferCard";
import { OfferDetailDialog } from "./OfferDetailDialog";
import { offerCountLabel } from "./format";
import { useListingSearch } from "./use-listing-search";

/** Leaflet needs `window`, so the map renders only in the browser. */
const SearchMap = dynamic(() => import("./SearchMap").then((module) => module.SearchMap), {
  ssr: false,
  loading: () => <div className={`${searchStyles.map} ${searchStyles.mapLoading}`} role="status">Cargando mapa…</div>,
});

export function ListingSearch() {
  const { state, actions } = useListingSearch();
  const { detailError, detailLoading, detailUnavailable, focusedGroup, groups, hasMore, loadingMore, location, locationNotice,
    moreError, options, optionsError, picking, point, radiusKm, results, selected, status, visibleResults } = state;
  const { changeRadius, clearFocus, closeDetail, focusEstablishment, loadMore, locate, openDetail, pickPoint, refresh,
    setPicking } = actions;

  return <div className={searchStyles.page}><a className={styles.skipLink} href="#resultados">Ir a resultados</a>
    <header className={searchStyles.header}>
      <span className={`${styles.brand} ${searchStyles.brand}`}><span className={styles.brandMark} aria-hidden="true">✳</span><span>XFood</span></span>
      <span className={searchStyles.headerNote}>Ofertas de alimentos a precio reducido</span>
    </header>
    <main className={styles.content}>
      <div className={styles.headingRow}><div><div className={styles.eyebrow}>COMIDA A BAJO COSTO</div><h1>Ofertas cerca de ti</h1>
        <p className={styles.subtitle}>Encuentra excedentes de alimentos disponibles a precio reducido y sus condiciones de recogida.</p></div></div>

      <div className={searchStyles.toolbar}>
        <p className={searchStyles.locationLabel} role="status">{locationLabel(location, picking)}</p>
        <div className={styles.controls}>
          <label className={styles.filter}>Radio<select aria-label="Radio de búsqueda" value={radiusKm ?? ""} disabled={!options}
            onChange={(event) => changeRadius(Number(event.target.value))}>
            {!options && <option value="">—</option>}
            {options?.radiiKm.map((value) => <option key={value} value={value}>{value} km</option>)}
          </select></label>
          <button className={styles.secondaryButton} onClick={() => void locate()} disabled={location.kind === "locating"}>Usar mi ubicación</button>
          <button className={styles.secondaryButton} onClick={() => setPicking(!picking)} aria-pressed={picking}>
            {picking ? "Cancelar selección" : "Elegir en el mapa"}</button>
          <button className={styles.secondaryButton} onClick={refresh} disabled={!point || !options || status === "loading"}>Actualizar ofertas</button>
        </div>
      </div>

      {optionsError && <div className={styles.noticeError} role="alert"><span>!</span><div>No se pudo cargar la configuración de búsqueda: {optionsError}<button onClick={refresh}>Volver a intentar</button></div></div>}
      {locationNotice && location.kind === "ready" && <div className={styles.noticeWarning} role="status">{locationNotice}</div>}

      <div className={searchStyles.layout}>
        <section className={searchStyles.mapPanel} aria-label="Mapa">
          <SearchMap point={point} radiusKm={radiusKm} groups={groups} picking={picking}
            focusedEstablishmentId={focusedGroup?.establishment.id ?? ""} onPick={pickPoint} onSelectEstablishment={focusEstablishment} />
          {(picking || location.kind === "manual") && <p className={searchStyles.mapHint}>Toca el mapa para elegir el punto de búsqueda.</p>}
        </section>

        <section className={searchStyles.results} id="resultados" aria-labelledby="results-title" aria-busy={status === "loading"}>
          <div className={styles.listHeader}><div><h2 id="results-title">{resultsTitle(status, results.length, hasMore)}</h2>
            <p>{radiusKm ? `Dentro de ${radiusKm} km del punto de búsqueda` : "Elige una ubicación para buscar"}</p></div></div>
          {focusedGroup && <div className={searchStyles.focusChip}><span>Ofertas de <strong>{focusedGroup.establishment.name}</strong></span>
            <button onClick={clearFocus}>Ver todas</button></div>}
          <SearchResults state={state} onOpen={(listing) => void openDetail(listing)} onRetry={refresh} />
          {moreError && status === "ready" && <div className={styles.noticeError} role="alert"><span>!</span><div>{moreError}<button onClick={() => void loadMore()}>Volver a intentar</button></div></div>}
          {status === "ready" && hasMore && <button className={`${styles.secondaryButton} ${searchStyles.loadMore}`} onClick={() => void loadMore()} disabled={loadingMore}>
            {loadingMore ? "Cargando…" : "Cargar más ofertas"}</button>}
          {visibleResults.length > 0 && <p className={searchStyles.statusLine}>Mostrando {offerCountLabel(visibleResults.length)}.</p>}
        </section>
      </div>
      <footer className={styles.footer}>XFood <span>·</span> Aprovechar mejor, juntos.</footer>
    </main>
    {selected && <OfferDetailDialog listing={selected} loading={detailLoading} error={detailError} unavailable={detailUnavailable} onClose={closeDetail} />}
  </div>;
}

type SearchState = ReturnType<typeof useListingSearch>["state"];

function SearchResults({ state, onOpen, onRetry }: { state: SearchState; onOpen: Parameters<typeof OfferCard>[0]["onOpen"]; onRetry: () => void }) {
  const { location, options, optionsError, radiusKm, searchError, status, visibleResults } = state;
  if (location.kind === "manual") {
    return <div className={styles.emptyState}><div className={styles.emptyIllustration}><span>⌖</span></div><h3>Elige un punto en el mapa</h3><p>{location.message}</p></div>;
  }
  if (optionsError && !options) {
    return <div className={styles.emptyState}><h3>No pudimos preparar la búsqueda</h3><p>Revisa la conexión e inténtalo de nuevo.</p>
      <button className={styles.secondaryButton} onClick={onRetry}>Volver a intentar</button></div>;
  }
  if (location.kind === "locating" || status === "idle" || status === "loading") return <LoadingResults />;
  if (status === "error") {
    return <div className={styles.emptyState}><h3>No pudimos cargar las ofertas</h3><p>{searchError || "Revisa la conexión e inténtalo de nuevo."}</p>
      <button className={styles.secondaryButton} onClick={onRetry}>Volver a intentar</button></div>;
  }
  if (!visibleResults.length) {
    return <div className={styles.emptyState}><div className={styles.emptyIllustration}><span>◌</span><i>✦</i></div><h3>No hay ofertas en este radio</h3>
      <p>{radiusKm === options?.radiiKm.at(-1) ? "Prueba con otro punto del mapa o vuelve más tarde." : "Prueba con un radio mayor o con otro punto del mapa."}</p></div>;
  }
  return <div className={searchStyles.offerList}>{visibleResults.map((listing) => <OfferCard key={listing.id} listing={listing} onOpen={onOpen} />)}</div>;
}

function LoadingResults() {
  return <div className={searchStyles.offerList} role="status" aria-label="Cargando ofertas" aria-busy="true">
    {[1, 2, 3].map((item) => <div className={`${styles.skeleton} ${searchStyles.skeleton}`} key={item}><span /><span /></div>)}</div>;
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
