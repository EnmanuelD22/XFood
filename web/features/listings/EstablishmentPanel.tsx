"use client";

import styles from "@/app/page.module.css";
import { DeactivateDialog } from "./DeactivateDialog";
import { ListingCard } from "./ListingCard";
import { ListingFormDialog } from "./ListingFormDialog";
import { useEstablishmentPanel } from "./use-establishment-panel";

export function EstablishmentPanel() {
  const { state, actions } = useEstablishmentPanel();
  const { canManage, deactivating, deactivationBusy, deactivationError, account, categories, categoryLoadError, categoryPathReady, checkingVisibility, editing, establishmentId,
    establishments, fieldErrors, filter, form, formError, formOpen, listPathReady, listings, loadError, loading, query,
    saving, selectedEstablishment, success, timeZone, visibilityChecks, visibleListings } = state;
  const { changeEstablishment, checkPublicVisibility, deactivateListing, requestDeactivation, setDeactivating, loadContext, loadListings, logout, openCreate, openEdit,
    saveListing, setFilter, setForm, setFormOpen, setQuery } = actions;

  return <div className={styles.shell}><a className={styles.skipLink} href="#publicaciones">Ir a publicaciones</a>
    <aside className={styles.sidebar}>
      <a className={styles.brand} href="#inicio" aria-label="XFood, panel del establecimiento"><span className={styles.brandMark}>✳</span><span>XFood</span></a>
      <div className={styles.workspaceLabel}>ESPACIO DE TRABAJO</div>
      <nav className={styles.nav} aria-label="Navegación del establecimiento"><a href="#inicio" aria-label="Inicio del panel" className={styles.navLink}><span>⌂</span> Inicio</a><a href="#publicaciones" aria-current="page" aria-label="Mis publicaciones" className={`${styles.navLink} ${styles.navActive}`}><span>▤</span> Mis publicaciones</a></nav>
      <div className={styles.sideBottom}><div className={styles.sideHint}><span className={styles.spark}>✦</span><strong>Menos desperdicio,<br />más impacto.</strong><p>Cada excedente aprovechado cuenta.</p></div>
        <button className={styles.profileButton} onClick={() => void logout()} title="Cerrar sesión" aria-label="Cerrar sesión"><span className={styles.avatar}>{selectedEstablishment?.name?.slice(0, 1) ?? "X"}</span><span className={styles.profileText}><strong>{selectedEstablishment?.name ?? "Establecimiento"}</strong><small>Cerrar sesión</small></span><span aria-hidden="true">↗</span></button>
      </div>
    </aside>
    <main className={styles.main} id="inicio">
      <header className={styles.topbar}><div className={styles.breadcrumb}>Panel <span>/</span> <strong>Mis publicaciones</strong></div><div className={styles.headerRight}><span className={styles.liveDot} /> Gestión del establecimiento <span className={styles.headerAvatar}>{selectedEstablishment?.name?.slice(0, 1) ?? "X"}</span></div></header>
      <div className={styles.content} id="publicaciones">
        <div className={styles.headingRow}><div><div className={styles.eyebrow}>TU ESPACIO DE IMPACTO</div><h1>Mis publicaciones</h1><p className={styles.subtitle}>Administra tus excedentes y ayúdalos a encontrar un nuevo destino.</p></div><button className={styles.primaryButton} onClick={openCreate} disabled={!canManage || saving || deactivationBusy}>＋ <span>Publicar excedente</span></button></div>
        {establishments.length > 1 && <label className={styles.establishmentPicker}>Establecimiento<select aria-label="Establecimiento" disabled={saving || deactivationBusy} value={establishmentId} onChange={(event) => void changeEstablishment(event.target.value)}><option value="">Selecciona el establecimiento</option>{establishments.map((item) => <option key={item.id} value={item.id}>{item.name}{item.isPrimary ? " · Principal" : ""}</option>)}</select></label>}
        <PanelMetrics listings={listings} listPathReady={listPathReady && !loading && !loadError && canManage} />
        {loadError && <div className={styles.noticeError} role="alert"><span>!</span><div>{loadError}<button onClick={() => void loadContext()}>Volver a intentar</button></div></div>}
        {success && <div className={styles.noticeSuccess} role="status">✓ {success}</div>}
        <div className={styles.listHeader}><div><h2>Tus excedentes</h2><p>Publicaciones del establecimiento seleccionado</p></div><div className={styles.controls}>
          <label className={styles.search}><span aria-hidden="true">⌕</span><input aria-label="Buscar publicaciones" placeholder="Buscar publicación..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label className={styles.filter}>Estado<select aria-label="Estado" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Todos</option><option>Activa</option><option>Agotada</option><option>Desactivada</option><option>Vencida</option></select></label>
        </div></div>
        {loading ? <LoadingCards /> : establishments.length > 1 && !selectedEstablishment ? <SelectEstablishment /> : !canManage ? <div className={styles.emptyState}><h3>{account?.role === "Establishment" ? "No hay un establecimiento habilitado" : "Acceso para establecimientos"}</h3><p>Inicia sesión con una cuenta activa y un establecimiento autorizado para administrar publicaciones.</p></div> : !listPathReady ? <PendingList /> : visibleListings.length === 0 ? <EmptyState filtered={Boolean(query || filter !== "all")} hasError={Boolean(loadError)} onCreate={openCreate} onRetry={() => void loadListings(establishmentId)} /> :
          <div className={styles.cardGrid}>{visibleListings.map((listing) => <ListingCard key={listing.id} listing={listing} categories={categories} timeZone={timeZone}
            visibility={visibilityChecks[listing.id]} checking={checkingVisibility === listing.id} onEdit={openEdit} onDeactivate={requestDeactivation} onCheckVisibility={checkPublicVisibility} />)}</div>}
        <footer className={styles.footer}>XFood <span>·</span> Aprovechar mejor, juntos.</footer>
      </div>
    </main>
    {deactivating && <DeactivateDialog title={deactivating.title} busy={deactivationBusy} error={deactivationError} onClose={() => setDeactivating(null)} onConfirm={(reason) => void deactivateListing(reason)} />}
    {formOpen && canManage && <ListingFormDialog categories={categories} categoryPathReady={categoryPathReady} categoryLoadError={categoryLoadError}
      editing={editing} errors={fieldErrors} form={form} formError={formError} saving={saving} timeZone={timeZone}
      onChange={setForm} onClose={() => setFormOpen(false)} onSubmit={saveListing} />}
  </div>;
}

function PanelMetrics({ listings, listPathReady }: { listings: ReturnType<typeof useEstablishmentPanel>["state"]["listings"]; listPathReady: boolean }) {
  const active = listings.filter((item) => item.status === 1 && item.availableQuantity > 0 && item.isFoodFit && new Date(item.pickupDeadlineUtc) > new Date()).length;
  const units = listings.filter((item) => item.status === 1 && item.isFoodFit && new Date(item.pickupDeadlineUtc) > new Date()).reduce((sum, item) => sum + item.availableQuantity, 0);
  return <div className={styles.metrics}>
    <div className={styles.metricCard}><div className={styles.metricIcon}>▤</div><span>Publicaciones</span><strong>{listPathReady ? listings.length : "—"}<small>{listPathReady ? " en total" : " sin datos"}</small></strong></div>
    <div className={styles.metricCard}><div className={`${styles.metricIcon} ${styles.iconGreen}`}>↗</div><span>Activas</span><strong>{listPathReady ? active : "—"}<small>{listPathReady ? " disponibles" : " sin datos"}</small></strong></div>
    <div className={styles.metricCard}><div className={`${styles.metricIcon} ${styles.iconGold}`}>◷</div><span>Unidades disponibles</span><strong>{listPathReady ? units : "—"}<small>{listPathReady ? " unidades" : " sin datos"}</small></strong></div>
    <div className={styles.impactCard}><span className={styles.impactGlyph}>✳</span><div><strong>Tu impacto empieza aquí</strong><p>Publicar excedentes ayuda a que más alimentos lleguen a quienes los necesitan.</p></div></div>
  </div>;
}

function LoadingCards() {
  return <div className={styles.cardGrid} role="status" aria-label="Cargando publicaciones" aria-busy="true">{[1, 2, 3].map((item) => <div className={styles.skeleton} key={item}><div /><span /><span /></div>)}</div>;
}

function PendingList() {
  return <div className={styles.pendingCard}><div className={styles.pendingIcon}>◷</div><div><strong>Falta configurar la ruta de publicaciones propias.</strong><p>Configura <code>NEXT_PUBLIC_XFOOD_MY_LISTINGS_PATH</code> en <code>.env.local</code> y reinicia Next.js para cargar los datos reales.</p></div></div>;
}

function SelectEstablishment() {
  return <div className={styles.emptyState}><h3>Selecciona un establecimiento</h3><p>Elige el establecimiento que quieres administrar para consultar sus publicaciones.</p></div>;
}

function EmptyState({ filtered, hasError, onCreate, onRetry }: { filtered: boolean; hasError: boolean; onCreate: () => void; onRetry: () => void }) {
  return <div className={styles.emptyState}><div className={styles.emptyIllustration}><span>◌</span><i>✦</i></div><h3>{hasError ? "No pudimos cargar tus publicaciones" : filtered ? "No hay coincidencias" : "Aún no hay publicaciones"}</h3>
    <p>{hasError ? "Revisa la conexión e inténtalo de nuevo." : filtered ? "Prueba otro texto o selecciona todos los estados." : "Cuando publiques tu primer excedente, aparecerá aquí con su estado y disponibilidad."}</p>
    {hasError ? <button className={styles.secondaryButton} onClick={onRetry}>Volver a intentar</button> : !filtered && <button className={styles.secondaryButton} onClick={onCreate}>Crear primera publicación</button>}
  </div>;
}
