"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiGetWithHeaders, apiRequest, ApiRequestError } from "@/features/listings/api";
import type { SearchOptions } from "@/features/listings/types";
import { GEOLOCATION_OPTIONS, SEARCH_OPTIONS_PATH } from "./constants";
import {
  buildDetailPath,
  buildSearchPath,
  groupByEstablishment,
  hasNextPage,
  locationErrorMessage,
  mergeById,
  searchKey,
} from "./format";
import type { GeoPoint, ListingSummary, LocationState, SearchStatus } from "./types";

const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const FIRST_PAGE = 1;

/** Result of the search identified by `key`; a different key means that result is stale. */
type SearchOutcome = { key: string; results: ListingSummary[]; page: number; hasMore: boolean; error: string };
type KeyedValue = { key: string; value: string };
type DevicePosition = { ok: true; point: GeoPoint } | { ok: false; code?: number };

function getDevicePosition() {
  return new Promise<DevicePosition>((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve({ ok: false });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ ok: true, point: { latitude: coords.latitude, longitude: coords.longitude } }),
      (error) => resolve({ ok: false, code: error.code }),
      GEOLOCATION_OPTIONS,
    );
  });
}

async function fetchPage(point: GeoPoint, radiusKm: number, page: number, pageSize: number) {
  const { data, headers } = await apiGetWithHeaders<ListingSummary[]>(buildSearchPath(point, radiusKm, page, pageSize));
  return { data, hasMore: hasNextPage(headers) };
}

function searchErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError && error.status === HTTP_BAD_REQUEST) {
    return "La ubicación o el radio no son válidos. Elige otro punto e inténtalo de nuevo.";
  }
  return (error as Error).message || "No se pudieron cargar las ofertas.";
}

export function useListingSearch() {
  const moreRequest = useRef<AbortController | null>(null);
  const detailRequest = useRef<AbortController | null>(null);

  const [options, setOptions] = useState<SearchOptions | null>(null);
  const [optionsError, setOptionsError] = useState("");
  const [optionsAttempt, setOptionsAttempt] = useState(0);
  const [location, setLocation] = useState<LocationState>({ kind: "locating" });
  const [locationNotice, setLocationNotice] = useState("");
  const [picking, setPicking] = useState(false);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<SearchOutcome | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<KeyedValue | null>(null);
  const [focus, setFocus] = useState<KeyedValue | null>(null);
  const [selected, setSelected] = useState<ListingSummary | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailUnavailable, setDetailUnavailable] = useState(false);

  const point = location.kind === "ready" ? location.point : null;
  const radiusKm = selectedRadiusKm ?? options?.defaultRadiusKm ?? null;
  const pageSize = options?.defaultPageSize ?? null;
  const queryKey = point && radiusKm ? searchKey(point, radiusKm, attempt) : "";
  const current = outcome && outcome.key === queryKey ? outcome : null;
  const status: SearchStatus = !queryKey || !pageSize ? "idle" : !current ? "loading" : current.error ? "error" : "ready";
  const results = useMemo(() => current?.results ?? [], [current]);
  const groups = useMemo(() => groupByEstablishment(results), [results]);
  const focusedGroup = focus?.key === queryKey ? groups.find((group) => group.establishment.id === focus.value) : undefined;
  const visibleResults = focusedGroup?.listings ?? results;

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<SearchOptions>(SEARCH_OPTIONS_PATH, { signal: controller.signal })
      .then((value) => {
        setOptions(value);
        setOptionsError("");
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) setOptionsError(error.message || "No se pudo cargar la configuración de búsqueda.");
      });
    return () => controller.abort();
  }, [optionsAttempt]);

  useEffect(() => {
    let active = true;
    void getDevicePosition().then((position) => {
      if (!active) return;
      if (position.ok) {
        setLocation((previous) => previous.kind === "ready" && previous.source === "manual"
          ? previous
          : { kind: "ready", source: "device", point: position.point });
        return;
      }
      const message = locationErrorMessage(position.code);
      setLocation((previous) => previous.kind === "ready" ? previous : { kind: "manual", message });
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!queryKey || !point || !radiusKm || !pageSize) return;
    const controller = new AbortController();
    fetchPage(point, radiusKm, FIRST_PAGE, pageSize)
      .then((page) => {
        if (controller.signal.aborted) return;
        setOutcome({ key: queryKey, results: mergeById([], page.data), page: FIRST_PAGE, hasMore: page.hasMore, error: "" });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setOutcome({ key: queryKey, results: [], page: FIRST_PAGE, hasMore: false, error: searchErrorMessage(error) });
      });
    return () => controller.abort();
  }, [pageSize, point, queryKey, radiusKm]);

  useEffect(() => () => {
    moreRequest.current?.abort();
    detailRequest.current?.abort();
  }, []);

  async function locate() {
    setLocationNotice("");
    setLocation((previous) => previous.kind === "ready" ? previous : { kind: "locating" });
    const position = await getDevicePosition();
    if (position.ok) {
      setPicking(false);
      setLocation({ kind: "ready", source: "device", point: position.point });
      return;
    }
    const message = locationErrorMessage(position.code);
    setLocation((previous) => previous.kind === "ready" ? previous : { kind: "manual", message });
    setLocationNotice(message);
  }

  function pickPoint(target: GeoPoint) {
    setPicking(false);
    setLocationNotice("");
    setLocation({ kind: "ready", source: "manual", point: target });
  }

  function changeRadius(value: number) {
    if (options?.radiiKm.includes(value)) setSelectedRadiusKm(value);
  }

  function refresh() {
    if (!options) {
      setOptionsError("");
      setOptionsAttempt((value) => value + 1);
      return;
    }
    setAttempt((value) => value + 1);
  }

  async function loadMore() {
    if (!current?.hasMore || loadingMore || !point || !radiusKm || !pageSize) return;
    const key = current.key;
    const nextPage = current.page + 1;
    moreRequest.current?.abort();
    const controller = new AbortController();
    moreRequest.current = controller;
    setLoadingMore(true);
    setMoreError(null);

    try {
      const page = await fetchPage(point, radiusKm, nextPage, pageSize);
      if (controller.signal.aborted) return;
      setOutcome((previous) => previous?.key === key
        ? { ...previous, results: mergeById(previous.results, page.data), page: nextPage, hasMore: page.hasMore }
        : previous);
    } catch (error) {
      if (controller.signal.aborted) return;
      setMoreError({ key, value: searchErrorMessage(error) });
    } finally {
      if (!controller.signal.aborted) setLoadingMore(false);
    }
  }

  function focusEstablishment(establishmentId: string) {
    setFocus((previous) => previous?.key === queryKey && previous.value === establishmentId
      ? null
      : { key: queryKey, value: establishmentId });
  }

  async function openDetail(listing: ListingSummary) {
    detailRequest.current?.abort();
    const controller = new AbortController();
    detailRequest.current = controller;
    setSelected(listing);
    setDetailError("");
    setDetailUnavailable(false);
    setDetailLoading(true);

    try {
      const detail = await apiRequest<ListingSummary>(buildDetailPath(listing.id, point), { signal: controller.signal });
      if (controller.signal.aborted) return;
      setSelected(detail);
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ApiRequestError && error.status === HTTP_NOT_FOUND) {
        setDetailUnavailable(true);
        setDetailError("Esta oferta ya no está disponible. Actualizamos los resultados.");
        setOutcome((previous) => previous && { ...previous, results: previous.results.filter((item) => item.id !== listing.id) });
        refresh();
        return;
      }
      setDetailError((error as Error).message || "No se pudo cargar el detalle de la oferta.");
    } finally {
      if (!controller.signal.aborted) setDetailLoading(false);
    }
  }

  function closeDetail() {
    detailRequest.current?.abort();
    setSelected(null);
    setDetailError("");
    setDetailUnavailable(false);
    setDetailLoading(false);
  }

  return {
    state: {
      detailError, detailLoading, detailUnavailable, focusedGroup, groups, hasMore: Boolean(current?.hasMore), loadingMore,
      location, locationNotice, moreError: moreError?.key === queryKey ? moreError.value : "", options, optionsError,
      picking, point, radiusKm, results, searchError: current?.error ?? "", selected, status, visibleResults,
    },
    actions: {
      changeRadius, clearFocus: () => setFocus(null), closeDetail, focusEstablishment, loadMore, locate, openDetail,
      pickPoint, refresh, setPicking,
    },
  };
}
