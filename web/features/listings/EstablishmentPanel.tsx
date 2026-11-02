"use client";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SelectField } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { usePanelAccount } from "@/features/panel/use-panel-account";
import { DeactivateDialog } from "./DeactivateDialog";
import { ListingCard } from "./ListingCard";
import { ListingFormDialog } from "./ListingFormDialog";
import styles from "./panel.module.css";
import type { Listing } from "./types";
import { useEstablishmentPanel } from "./use-establishment-panel";

const STATUS_FILTERS = ["Activa", "Agotada", "Desactivada", "Vencida"];
/** Cards in the first row of the widest layout load their image eagerly. */
const EAGER_IMAGES = 4;

export function EstablishmentPanel() {
  const { state, actions } = useEstablishmentPanel(usePanelAccount());
  const { canManage, deactivating, deactivationBusy, deactivationError, categories, categoryLoadError, categoryPathReady, checkingVisibility,
    editing, establishmentId, establishments, fieldErrors, filter, form, formError, formOpen, listPathReady, listings, loadError, loading,
    query, saving, selectedEstablishment, success, timeZone, visibilityChecks, visibleListings } = state;
  const { changeEstablishment, checkPublicVisibility, deactivateListing, requestDeactivation, setDeactivating, loadContext, loadListings,
    openCreate, openEdit, saveListing, setFilter, setForm, setFormOpen, setQuery } = actions;
  const busy = saving || deactivationBusy;
  const filtered = Boolean(query || filter !== "all");

  return <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{selectedEstablishment?.name ?? "Establecimiento"}</p>
        <h1 className={styles.title}>Mis publicaciones</h1>
        <p className={styles.subtitle}>Gestiona tus excedentes</p>
      </div>
      <PanelMetrics listings={listings} ready={listPathReady && !loading && !loadError && canManage} />
      <Button variant="accent" icon="plus" className={styles.create} onClick={openCreate} disabled={!canManage || busy}>Publicar excedente</Button>
    </header>

    {establishments.length > 1 && <SelectField label="Establecimiento" className={styles.picker} disabled={busy} value={establishmentId}
      onChange={(event) => void changeEstablishment(event.target.value)}>
      <option value="">Selecciona el establecimiento</option>
      {establishments.map((item) => <option key={item.id} value={item.id}>{item.name}{item.isPrimary ? " · Principal" : ""}</option>)}
    </SelectField>}

    {(loadError || success) && <div className={styles.notices}>
      {loadError && <Notice tone="error" action={{ label: "Volver a intentar", onClick: () => void loadContext() }}>{loadError}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}
    </div>}

    <section aria-labelledby="listings-title" className={styles.listings}>
      <h2 id="listings-title" className="sr-only">Tus excedentes</h2>
      <div className={styles.toolbar} role="search">
        <div className={styles.search}>
          <Icon name="search" size={20} />
          <label htmlFor="listing-search" className="sr-only">Buscar publicaciones</label>
          <input id="listing-search" type="search" placeholder="Buscar por nombre, categoría o descripción…" value={query}
            onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className={styles.filter}>
          <label htmlFor="listing-status" className="sr-only">Estado</label>
          <select id="listing-status" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">Todos los estados</option>
            {STATUS_FILTERS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <Icon name="chevronDown" size={18} />
        </div>
      </div>
      {!loading && canManage && listPathReady && listings.length > 0 &&
        <p className={styles.count} role="status">{countLabel(visibleListings.length, listings.length, filtered)}</p>}

      {loading ? <SkeletonCards className={styles.grid} count={4} label="Cargando publicaciones" />
        : establishments.length > 1 && !selectedEstablishment ? <EmptyState icon="store" title="Selecciona un establecimiento">
          Elige el establecimiento que quieres administrar para consultar sus publicaciones.
        </EmptyState>
        : !canManage ? <EmptyState icon="store" title="No hay un establecimiento habilitado">
          Tu cuenta necesita un establecimiento activo para administrar publicaciones.
        </EmptyState>
        : !listPathReady ? <Notice tone="warning" title="Falta configurar la ruta de publicaciones propias.">
          Configura <code>NEXT_PUBLIC_XFOOD_MY_LISTINGS_PATH</code> en <code>.env.local</code> y reinicia Next.js.
        </Notice>
        : visibleListings.length === 0 ? <ListEmpty filtered={filtered} hasError={Boolean(loadError)} onCreate={openCreate} onRetry={() => void loadListings(establishmentId)} />
        : <div className={styles.grid}>
          {visibleListings.map((listing, index) => <ListingCard key={listing.id} listing={listing} categories={categories} timeZone={timeZone}
            priority={index < EAGER_IMAGES} visibility={visibilityChecks[listing.id]} checking={checkingVisibility === listing.id}
            onEdit={openEdit} onDeactivate={requestDeactivation} onCheckVisibility={checkPublicVisibility} />)}
        </div>}
    </section>

    {deactivating && <DeactivateDialog title={deactivating.title} busy={deactivationBusy} error={deactivationError}
      onClose={() => setDeactivating(null)} onConfirm={(reason) => void deactivateListing(reason)} />}
    {formOpen && canManage && <ListingFormDialog categories={categories} categoryPathReady={categoryPathReady} categoryLoadError={categoryLoadError}
      editing={editing} errors={fieldErrors} form={form} formError={formError} saving={saving} timeZone={timeZone}
      onChange={setForm} onClose={() => setFormOpen(false)} onSubmit={saveListing} />}
  </div>;
}

function countLabel(visible: number, total: number, filtered: boolean) {
  const noun = (count: number) => `${count} ${count === 1 ? "publicación" : "publicaciones"}`;
  return filtered ? `Mostrando ${visible} de ${noun(total)}` : noun(total);
}

/** Expired, deactivated or unfit lots never count as available, matching what the public search shows. */
function PanelMetrics({ listings, ready }: { listings: Listing[]; ready: boolean }) {
  const now = new Date();
  const live = listings.filter((item) => item.status === 1 && item.isFoodFit && new Date(item.pickupDeadlineUtc) > now);
  const active = live.filter((item) => item.availableQuantity > 0).length;
  const units = live.reduce((sum, item) => sum + item.availableQuantity, 0);
  return <dl className={styles.metrics}>
    <Metric icon="listings" label="Publicaciones activas" value={ready ? active : null} caption="Visibles en XFood" />
    <Metric icon="box" label="Productos disponibles" value={ready ? units : null} caption="Unidades en total" />
  </dl>;
}

function Metric({ icon, label, value, caption }: { icon: IconName; label: string; value: number | null; caption: string }) {
  return <div className={styles.metric}>
    <span className={styles.metricIcon}><Icon name={icon} size={20} /></span>
    <div>
      <dt>{label}</dt>
      <dd>
        <span className={styles.metricValue}>
          <strong>{value ?? "—"}</strong>{value !== null && <span className={styles.liveDot} aria-hidden="true" />}
        </span>
        <span className={styles.metricCaption}>{value === null ? "Sin datos" : caption}</span>
      </dd>
    </div>
  </div>;
}

function ListEmpty({ filtered, hasError, onCreate, onRetry }: { filtered: boolean; hasError: boolean; onCreate: () => void; onRetry: () => void }) {
  if (hasError) {
    return <EmptyState icon="alert" title="No pudimos cargar tus publicaciones"
      action={<Button variant="secondary" icon="refresh" onClick={onRetry}>Volver a intentar</Button>}>Revisa la conexión e inténtalo de nuevo.</EmptyState>;
  }
  if (filtered) return <EmptyState icon="search" title="No hay coincidencias">Prueba otro texto o selecciona todos los estados.</EmptyState>;
  return <EmptyState icon="sprout" title="Aún no hay publicaciones"
    action={<Button icon="plus" onClick={onCreate}>Crear primera publicación</Button>}>
    Cuando publiques tu primer excedente, aparecerá aquí con su estado y disponibilidad.
  </EmptyState>;
}
