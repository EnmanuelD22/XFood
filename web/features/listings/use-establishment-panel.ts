"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiGetWithHeaders, apiRequest, ApiRequestError } from "./api";
import { EMPTY_FORM } from "./constants";
import {
  getListingStatus,
  localInputToUtc,
  mapServerErrors,
  rememberEstablishment,
  toUpdateForm,
  validateSaleForm,
} from "./format";
import type {
  Account,
  Category,
  EstablishmentProfile,
  FieldErrors,
  FormValues,
  Listing,
  SearchOptions,
  VisibilityCheck,
} from "./types";

export function useEstablishmentPanel() {
  const categoryPath = process.env.NEXT_PUBLIC_XFOOD_CATEGORIES_PATH;
  const categoryPathReady = Boolean(categoryPath);

  const [account, setAccount] = useState<Account | null>(null);
  const [establishmentId, setEstablishmentId] = useState("");
  const [timeZone, setTimeZone] = useState("America/Santo_Domingo");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoadError, setCategoryLoadError] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [listPathReady, setListPathReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [checkingVisibility, setCheckingVisibility] = useState("");
  const [visibilityChecks, setVisibilityChecks] = useState<Record<string, VisibilityCheck>>({});

  const establishments = useMemo(
    () => account?.establishments?.filter((item) => item.status === "Active") ?? [],
    [account],
  );
  const selectedEstablishment = establishments.find((item) => item.id === establishmentId);
  const visibleListings = useMemo(
    () => listings.filter((item) => {
      const matchesText = `${item.title} ${item.description}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase());
      const status = getListingStatus(item.status, item.pickupDeadlineUtc);
      return matchesText && (filter === "all" || status === filter);
    }),
    [filter, listings, query],
  );

  const loadListings = useCallback(async (id: string) => {
    setLoadError("");
    const path = process.env.NEXT_PUBLIC_XFOOD_MY_LISTINGS_PATH;
    if (!path) {
      setListPathReady(false);
      setListings([]);
      return;
    }

    setListPathReady(true);
    try {
      const route = path.replace("{establishmentId}", encodeURIComponent(id));
      const result = await apiRequest<Listing[]>(route);
      setListings(result.filter((item) => item.establishmentId === id));
    } catch (error) {
      setListings([]);
      setLoadError(
        error instanceof ApiRequestError && error.status === 401
          ? "Tu sesión terminó. Vuelve a iniciar sesión."
          : (error as Error).message || "No se pudieron cargar las publicaciones.",
      );
    }
  }, []);

  const loadProfile = useCallback(async (id: string) => {
    setCoordinates(null);
    const profile = await apiRequest<EstablishmentProfile>(`establishments/${id}`);
    if (profile.timeZoneId) setTimeZone(profile.timeZoneId);
    if (typeof profile.latitude === "number" && typeof profile.longitude === "number") {
      setCoordinates({ latitude: profile.latitude, longitude: profile.longitude });
    }
  }, []);

  const loadContext = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const currentAccount = await apiRequest<Account>("me");
      setAccount(currentAccount);
      if (currentAccount.role !== "Establishment" || currentAccount.status !== "Active") {
        setListings([]);
        setLoadError("Esta sección está disponible para una cuenta activa de establecimiento.");
        return;
      }

      const activeEstablishments = (currentAccount.establishments ?? [])
        .filter((item) => item.status === "Active");
      const requestedId = new URLSearchParams(window.location.search).get("establishmentId");
      const selected = activeEstablishments.find((item) => item.id === requestedId)
        ?? (activeEstablishments.length === 1
          ? activeEstablishments[0]
          : activeEstablishments.find((item) => item.isPrimary));

      if (!activeEstablishments.length) {
        setEstablishmentId("");
        setListings([]);
        setLoadError("Tu cuenta no tiene un establecimiento activo habilitado para administrar publicaciones.");
        return;
      }
      if (!selected) {
        setEstablishmentId("");
        setListings([]);
        return;
      }

      setEstablishmentId(selected.id);
      rememberEstablishment(selected.id);
      await loadProfile(selected.id);
      await loadListings(selected.id);
    } catch (error) {
      setAccount(null);
      setListings([]);
      setCoordinates(null);
      setLoadError(
        error instanceof ApiRequestError && error.status === 401
          ? "Inicia sesión con una cuenta de establecimiento para continuar."
          : (error as Error).message || "No se pudo conectar con XFood.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadListings, loadProfile]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  useEffect(() => {
    if (!categoryPath) return;

    void apiRequest<Category[]>(categoryPath)
      .then((items) => {
        setCategories(items.filter((item) => item.isActive !== false));
        setCategoryLoadError("");
      })
      .catch((error: Error) => {
        setCategories([]);
        setCategoryLoadError(error.message || "No se pudo cargar el catálogo de categorías.");
      });
  }, [categoryPath]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
    setSuccess("");
    setFormOpen(true);
  }

  function openEdit(item: Listing) {
    setEditing(item);
    setForm(toUpdateForm(item, timeZone));
    setFieldErrors({});
    setFormError("");
    setSuccess("");
    setFormOpen(true);
  }

  async function saveListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    const validationErrors = validateSaleForm(form, timeZone);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    if (!establishmentId || !categories.some((item) => item.id === form.categoryId)) {
      setFormError("Selecciona una categoría activa del catálogo disponible para poder guardar.");
      return;
    }

    setSaving(true);
    const payload = {
      categoryId: form.categoryId,
      title: form.title.trim(),
      description: form.description.trim(),
      initialQuantity: Number(form.initialQuantity),
      pickupInstructions: form.pickupInstructions.trim(),
      pickupStartsAtUtc: localInputToUtc(form.pickupStartsAt, timeZone),
      pickupDeadlineUtc: localInputToUtc(form.pickupDeadline, timeZone),
      originalUnitPrice: Number(form.originalUnitPrice),
      discountedUnitPrice: Number(form.discountedUnitPrice),
      paymentInstructions: form.paymentInstructions.trim(),
    };

    let savedListing: Listing | null = null;
    try {
      if (editing) {
        savedListing = await apiRequest<Listing>(`listings/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setListings((items) => items.map((item) =>
          item.id === savedListing?.id ? savedListing : item,
        ));
        setSuccess("Publicación actualizada.");
      } else {
        savedListing = await apiRequest<Listing>("listings", {
          method: "POST",
          body: JSON.stringify({ ...payload, establishmentId, foodSafetyDeclared: true }),
        });
        setListings((items) => [savedListing!, ...items.filter((item) => item.id !== savedListing!.id)]);
        setSuccess("Publicación creada y guardada.");
      }

      setFormOpen(false);
      await loadListings(establishmentId);
      if (
        savedListing.mode === 1 &&
        getListingStatus(savedListing.status, savedListing.pickupDeadlineUtc) === "Activa" &&
        savedListing.availableQuantity > 0
      ) {
        void checkPublicVisibility(savedListing);
      }
    } catch (error) {
      const apiError = error instanceof ApiRequestError ? error : null;
      setFormError(
        apiError?.status === 409
          ? "La publicación cambió mientras la editabas. Se actualizará la lista; revisa los datos antes de volver a intentar."
          : apiError?.status === 403
            ? "La API no autorizó esta operación para el establecimiento seleccionado."
            : (error as Error).message || "No se pudo guardar la publicación.",
      );
      setFieldErrors(mapServerErrors(apiError?.payload.errors));
      if (apiError?.status === 409) await loadListings(establishmentId);
    } finally {
      setSaving(false);
    }
  }

  async function checkPublicVisibility(item: Listing) {
    if (
      item.mode !== 1 || item.status !== 1 || item.availableQuantity < 1 ||
      getListingStatus(item.status, item.pickupDeadlineUtc) !== "Activa"
    ) {
      setVisibilityChecks((checks) => ({
        ...checks,
        [item.id]: {
          kind: "missing",
          message: "La búsqueda pública solo muestra ventas activas, vigentes y con unidades disponibles.",
        },
      }));
      return;
    }
    if (!coordinates) {
      setVisibilityChecks((checks) => ({
        ...checks,
        [item.id]: {
          kind: "error",
          message: "El perfil no tiene coordenadas para comprobar la búsqueda por ubicación.",
        },
      }));
      return;
    }

    setCheckingVisibility(item.id);
    setVisibilityChecks((checks) => {
      const next = { ...checks };
      delete next[item.id];
      return next;
    });

    try {
      const options = await apiRequest<SearchOptions>("listings/search-options");
      const params = new URLSearchParams({
        latitude: String(coordinates.latitude),
        longitude: String(coordinates.longitude),
        radiusKm: String(options.defaultRadiusKm),
        pageSize: String(options.maxResults),
      });
      let page = 1;
      let found = false;
      let hasNextPage = true;

      while (hasNextPage && page <= 1000) {
        params.set("page", String(page));
        const { data, headers } = await apiGetWithHeaders<Array<{ id: string }>>(
          `listings?${params.toString()}`,
        );
        if (data.some((result) => result.id === item.id)) {
          found = true;
          break;
        }
        hasNextPage = headers.get("x-has-next-page")?.toLowerCase() === "true";
        page += 1;
      }

      setVisibilityChecks((checks) => ({
        ...checks,
        [item.id]: found
          ? {
            kind: "success",
            message: `Aparece en la búsqueda pública dentro del radio configurado de ${options.defaultRadiusKm} km.`,
          }
          : {
            kind: "missing",
            message: hasNextPage
              ? "La publicación no apareció en las primeras 1000 páginas; limita la búsqueda y vuelve a probar."
              : `No aparece dentro del radio configurado de ${options.defaultRadiusKm} km. La API excluye ofertas vencidas, agotadas, desactivadas o no aptas.`,
          },
      }));
    } catch (error) {
      setVisibilityChecks((checks) => ({
        ...checks,
        [item.id]: {
          kind: "error",
          message: (error as Error).message || "No se pudo comprobar la búsqueda pública.",
        },
      }));
    } finally {
      setCheckingVisibility("");
    }
  }

  async function deactivateListing(item: Listing) {
    const reason = window.prompt(`Motivo para desactivar «${item.title}» (máximo 1000 caracteres):`);
    if (!reason?.trim()) return;
    if (reason.length > 1000) {
      setLoadError("El motivo admite hasta 1000 caracteres.");
      return;
    }
    if (!window.confirm(`¿Confirmas la desactivación de «${item.title}»? La publicación dejará de estar activa.`)) return;

    try {
      const updated = await apiRequest<Listing>(`listings/${item.id}/deactivate`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      setListings((items) => items.map((entry) => entry.id === updated.id ? updated : entry));
      setSuccess("Publicación desactivada.");
      await loadListings(establishmentId);
    } catch (error) {
      setLoadError((error as Error).message || "No se pudo desactivar la publicación.");
    }
  }

  async function changeEstablishment(id: string) {
    setEstablishmentId(id);
    setListings([]);
    setLoading(Boolean(id));
    setLoadError("");
    setVisibilityChecks({});
    rememberEstablishment(id);
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      await loadProfile(id);
      await loadListings(id);
    } catch (error) {
      setLoadError((error as Error).message || "No se pudo cargar el establecimiento.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await apiRequest("auth/logout", { method: "POST" });
      window.location.reload();
    } catch (error) {
      setLoadError((error as Error).message || "No se pudo cerrar la sesión.");
    }
  }

  return {
    state: {
      account,
      categories,
      categoryLoadError,
      categoryPathReady,
      checkingVisibility,
      editing,
      establishmentId,
      establishments,
      fieldErrors,
      filter,
      form,
      formError,
      formOpen,
      listPathReady,
      listings,
      loadError,
      loading,
      query,
      saving,
      selectedEstablishment,
      success,
      timeZone,
      visibilityChecks,
      visibleListings,
    },
    actions: {
      changeEstablishment,
      checkPublicVisibility,
      deactivateListing,
      loadContext,
      loadListings,
      logout,
      openCreate,
      openEdit,
      saveListing,
      setFilter,
      setForm,
      setFormOpen,
      setQuery,
    },
  };
}
