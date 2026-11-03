
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

import {
  Search,
  MapPin,
  SlidersHorizontal,
  Heart,
  Clock,
  ShoppingBasket,
  Leaf,
  X,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  getSearchOptions,
  getListingById,
  searchListings,
  type Listing,
  type SearchOptions,
} from "@/lib/api";

const CATEGORY_IMAGES: Record<string, string> = {
  frutas:
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop",
  panaderia:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop",
  vegetales:
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop",
  postres:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop",
  default:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop",
};

const getCategoryImage = (category: string) => {
  const normalized = category.toLowerCase();

  if (normalized.includes("fruta")) return CATEGORY_IMAGES.frutas;
  if (normalized.includes("pan")) return CATEGORY_IMAGES.panaderia;
  if (normalized.includes("veget")) return CATEGORY_IMAGES.vegetales;
  if (normalized.includes("postre")) return CATEGORY_IMAGES.postres;

  return CATEGORY_IMAGES.default;
};

const formatPrice = (price: number | null, currency: string) =>
  price === null
    ? "Precio no disponible"
    : `${currency} ${price.toLocaleString("es-DO")}`;

const formatDate = (date: string, timeZone: string) => {
  try {
    return new Intl.DateTimeFormat("es-DO", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timeZone || undefined,
    }).format(new Date(date));
  } catch {
    return new Date(date).toLocaleString("es-DO");
  }
};

type DemoOffer = {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  establishment: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    timeZoneId: string;
  };
  discountedUnitPrice: number;
  originalUnitPrice: number;
  currency: string;
  distanceKm: number;
  availableQuantity: number;
  pickupStartsAtUtc: string;
  pickupDeadlineUtc: string;
  pickupInstructions: string;
  image: string;
};

const demoOffers: DemoOffer[] = [
  {
    id: "demo-frutas",
    title: "Canasta de frutas frescas",
    description: "Selección de frutas frescas de temporada.",
    categoryName: "Frutas",
    establishment: {
      id: "demo-1",
      name: "Mercado Verde",
      address: "Dirección de demostración",
      latitude: 0,
      longitude: 0,
      timeZoneId: "America/Santo_Domingo",
    },
    discountedUnitPrice: 120,
    originalUnitPrice: 250,
    currency: "DOP",
    distanceKm: 1.2,
    availableQuantity: 8,
    pickupStartsAtUtc: "2026-11-01T20:00:00Z",
    pickupDeadlineUtc: "2026-11-01T22:00:00Z",
    pickupInstructions: "Recoger en el establecimiento.",
    image: CATEGORY_IMAGES.frutas,
  },
  {
    id: "demo-pan",
    title: "Pan artesanal del día",
    description: "Pan recién preparado, ideal para compartir.",
    categoryName: "Panadería",
    establishment: {
      id: "demo-2",
      name: "Panadería La Espiga",
      address: "Dirección de demostración",
      latitude: 0,
      longitude: 0,
      timeZoneId: "America/Santo_Domingo",
    },
    discountedUnitPrice: 85,
    originalUnitPrice: 180,
    currency: "DOP",
    distanceKm: 2.1,
    availableQuantity: 5,
    pickupStartsAtUtc: "2026-11-01T19:00:00Z",
    pickupDeadlineUtc: "2026-11-01T21:00:00Z",
    pickupInstructions: "Recoger en el establecimiento.",
    image: CATEGORY_IMAGES.panaderia,
  },
  {
    id: "demo-vegetales",
    title: "Vegetales seleccionados",
    description: "Variedad de vegetales frescos.",
    categoryName: "Vegetales",
    establishment: {
      id: "demo-3",
      name: "Huerto Natural",
      address: "Dirección de demostración",
      latitude: 0,
      longitude: 0,
      timeZoneId: "America/Santo_Domingo",
    },
    discountedUnitPrice: 150,
    originalUnitPrice: 300,
    currency: "DOP",
    distanceKm: 2.7,
    availableQuantity: 6,
    pickupStartsAtUtc: "2026-11-01T21:00:00Z",
    pickupDeadlineUtc: "2026-11-01T23:00:00Z",
    pickupInstructions: "Recoger en el establecimiento.",
    image: CATEGORY_IMAGES.vegetales,
  },
  {
    id: "demo-postres",
    title: "Postres variados",
    description: "Selección de postres para disfrutar.",
    categoryName: "Postres",
    establishment: {
      id: "demo-4",
      name: "Dulce Tentación",
      address: "Dirección de demostración",
      latitude: 0,
      longitude: 0,
      timeZoneId: "America/Santo_Domingo",
    },
    discountedUnitPrice: 100,
    originalUnitPrice: 200,
    currency: "DOP",
    distanceKm: 4.2,
    availableQuantity: 3,
    pickupStartsAtUtc: "2026-11-01T18:00:00Z",
    pickupDeadlineUtc: "2026-11-01T20:00:00Z",
    pickupInstructions: "Recoger en el establecimiento.",
    image: CATEGORY_IMAGES.postres,
  },
];

export default function Home() {
  const [offers, setOffers] = useState<Listing[]>([]);
  const [options, setOptions] = useState<SearchOptions | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [radius, setRadius] = useState(3);
  const [location, setLocation] = useState("Selecciona tu ubicación");
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<
    Listing | DemoOffer | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [page, setPage] = useState(1);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    getSearchOptions()
      .then((data) => {
        setOptions(data);
        setRadius(data.defaultRadiusKm);
      })
      .catch(() => {
        // La búsqueda puede funcionar aunque las opciones no estén disponibles.
      });
  }, []);

  const loadOffers = useCallback(
    async (pageNumber: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      setError("");

      try {
        const result = await searchListings({
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          radiusKm: coordinates ? radius : undefined,
          page: pageNumber,
          pageSize: options?.defaultPageSize ?? 20,
        });

        setOffers((current) =>
          append
            ? [
                ...current,
                ...result.listings.filter(
                  (item) =>
                    !current.some((existing) => existing.id === item.id)
                ),
              ]
            : result.listings
        );

        setPage(result.page);
        setHasNextPage(result.hasNextPage);
        setDemoMode(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar las ofertas."
        );

        if (!append) {
          setOffers([]);
          setDemoMode(true);
          setHasNextPage(false);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [coordinates, radius, options]
  );

useEffect(() => {
  let cancelled = false;

  async function initialLoad() {
    setLoading(true);
    setError("");

    try {
      const result = await searchListings({
        page: 1,
        pageSize: options?.defaultPageSize ?? 20,
      });

      if (cancelled) return;

      setOffers(result.listings);
      setPage(result.page);
      setHasNextPage(result.hasNextPage);
      setDemoMode(false);
    } catch (err) {
      if (cancelled) return;

      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar las ofertas."
      );

      setOffers([]);
      setDemoMode(true);
      setHasNextPage(false);
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  void initialLoad();

  return () => {
    cancelled = true;
  };
}, [options]);

  const visibleOffers = useMemo(
    () => (demoMode ? demoOffers : offers),
    [demoMode, offers]
  );

  const categories = useMemo(
    () => [
      "Todos",
      ...new Set(visibleOffers.map((offer) => offer.categoryName)),
    ],
    [visibleOffers]
  );

  const filteredOffers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return visibleOffers.filter((offer) => {
      const matchesSearch =
        !term ||
        offer.title.toLowerCase().includes(term) ||
        offer.establishment.name.toLowerCase().includes(term);

      const matchesCategory =
        category === "Todos" || offer.categoryName === category;

      return matchesSearch && matchesCategory;
    });
  }, [visibleOffers, search, category]);

  function getLocation() {
    if (!navigator.geolocation) {
      setError("Tu navegador no permite obtener la ubicación.");
      return;
    }

    setLocation("Obteniendo ubicación...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCoordinates(nextCoordinates);
        setLocation(
          `${nextCoordinates.latitude.toFixed(4)}, ${nextCoordinates.longitude.toFixed(4)}`
        );
      },
      () => {
        setLocation("No se pudo obtener tu ubicación");
        setError(
          "Permite el acceso a tu ubicación o utiliza la selección manual cuando esté disponible."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function openDetails(offer: Listing | DemoOffer) {
    setSelectedOffer(offer);

    if (demoMode) return;

    try {
      const detail = await getListingById(
        offer.id,
        coordinates?.latitude,
        coordinates?.longitude
      );
      setSelectedOffer(detail);
    } catch {
      setError("No se pudieron actualizar los detalles de esta oferta.");
    }
  }

  function toggleFavorite(id: string) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F8F3] text-[#17241D]">
      <header className="sticky top-0 z-20 border-b border-[#DCE4D9] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#214A31] text-[#C7EA67]">
              <Leaf size={23} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#214A31]">
              XFood<span className="text-[#8EAF48]">.</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#65716A] md:flex">
            <a href="#ofertas" className="text-[#214A31]">
              Explorar ofertas
            </a>
            <a href="#como-funciona" className="hover:text-[#214A31]">
              Cómo funciona
            </a>
          </nav>

          <button className="rounded-full border border-[#DCE4D9] px-5 py-2.5 text-sm font-semibold text-[#214A31] transition hover:bg-[#E2EBCB]">
            Iniciar sesión
          </button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#103625]">
        <div className="absolute inset-0">
<Image
  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&auto=format&fit=crop"
  alt="Variedad de alimentos frescos"
  fill
  priority
  sizes="100vw"
  unoptimized
  className="object-cover opacity-20"
/>
        </div>
        <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#C7EA67]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-10 lg:py-24">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-[#D9EBAF]">
            <Leaf size={15} />
            Menos desperdicio, más oportunidades
          </span>

          <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Buena comida.
            <span className="block text-[#C7EA67]">Mejores precios.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
            Descubre alimentos de calidad cerca de ti y aprovecha ofertas
            especiales mientras ayudas a reducir el desperdicio de comida.
          </p>

          <a
            href="#ofertas"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#C7EA67] px-6 py-3.5 font-bold text-[#103625] transition hover:bg-[#d8f58d]"
          >
            Explorar alimentos <Search size={18} />
          </a>
        </div>
      </section>

      <section id="ofertas" className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
        <div className="mb-8">
          <span className="text-sm font-bold uppercase tracking-widest text-[#78954A]">
            Encuentra alimentos
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#214A31]">
            Ofertas cerca de ti
          </h2>
          <p className="mt-2 text-[#65716A]">
            Explora opciones disponibles en establecimientos de tu zona.
          </p>
        </div>

        <div className="mb-6 grid gap-3 rounded-2xl border border-[#DCE4D9] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]">
          <div className="flex min-w-0 items-center gap-3 rounded-xl bg-[#F8F8F3] px-4 py-3">
            <MapPin className="shrink-0 text-[#78954A]" size={20} />
            <span className="min-w-0 flex-1 truncate text-sm text-[#65716A]">
              {location}
            </span>
            <button
              onClick={getLocation}
              className="shrink-0 text-sm font-bold text-[#214A31] hover:underline"
            >
              Mi ubicación
            </button>
          </div>

          <label className="flex items-center gap-2 rounded-xl bg-[#F8F8F3] px-4 py-3 text-sm">
            <SlidersHorizontal size={18} className="text-[#78954A]" />
            <span className="font-medium">Radio:</span>
            <select
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              className="bg-transparent font-bold text-[#214A31] outline-none"
            >
              {(options?.radiiKm ?? [1, 3, 5, 10]).map((value) => (
                <option key={value} value={value}>
                  {value} km
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#DCE4D9] bg-white px-4 py-3">
          <Search size={20} className="text-[#78954A]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar alimentos o establecimientos..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#9AA49C]"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                category === item
                  ? "bg-[#214A31] text-white"
                  : "border border-[#DCE4D9] bg-white text-[#65716A] hover:border-[#214A31]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mb-5 flex items-center justify-between">
          <p className="font-semibold text-[#214A31]">
            {filteredOffers.length} ofertas mostradas
          </p>
          <button
            onClick={() => void loadOffers(1)}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-semibold text-[#65716A] hover:text-[#214A31] disabled:opacity-50"
          >
            <RefreshCw size={15} /> Actualizar
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} aria-label="Cerrar aviso">
              <X size={18} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-20 text-[#65716A]">
            <LoaderCircle className="mb-3 animate-spin" size={36} />
            <p>Cargando ofertas...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DCE4D9] bg-white px-6 py-16 text-center">
            <ShoppingBasket
              className="mx-auto mb-4 text-[#78954A]"
              size={40}
            />
            <h3 className="text-xl font-bold text-[#214A31]">
              No encontramos ofertas
            </h3>
            <p className="mt-2 text-sm text-[#65716A]">
              Prueba otra búsqueda o categoría, o cambia tu ubicación.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredOffers.map((offer) => {
              const image = "image" in offer
                ? offer.image
                : getCategoryImage(offer.categoryName);

              return (
                <article
                  key={offer.id}
                  className="group overflow-hidden rounded-2xl border border-[#DCE4D9] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-48 overflow-hidden bg-[#E2EBCB]">
     <Image
  src={image}
  alt={`Imagen ilustrativa de ${offer.categoryName}`}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  unoptimized
  className="object-cover transition duration-500 group-hover:scale-105"
/>

                    <span className="absolute left-3 top-3 rounded-full bg-[#C7EA67] px-3 py-1 text-xs font-bold text-[#214A31]">
                      Disponible
                    </span>

                    <button
                      onClick={() => toggleFavorite(offer.id)}
                      aria-label="Agregar a favoritos"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition hover:scale-110"
                    >
                      <Heart
                        size={18}
                        className={
                          favorites.includes(offer.id)
                            ? "fill-red-500 text-red-500"
                            : "text-[#65716A]"
                        }
                      />
                    </button>
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#78954A]">
                      {offer.categoryName}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-[#214A31]">
                      {offer.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#65716A]">
                      {offer.establishment.name}
                    </p>

                    <div className="mt-4 flex flex-wrap items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-[#214A31]">
                        {formatPrice(
                          offer.discountedUnitPrice,
                          offer.currency
                        )}
                      </span>
                      {offer.originalUnitPrice !== null && (
                        <span className="text-sm text-[#9AA49C] line-through">
                          {formatPrice(
                            offer.originalUnitPrice,
                            offer.currency
                          )}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 border-t border-[#DCE4D9] pt-3 text-xs text-[#65716A]">
                      <p className="flex items-center gap-2">
                        <MapPin size={15} />
                        {offer.distanceKm !== null
                          ? `${offer.distanceKm.toFixed(1)} km de distancia`
                          : "Distancia no disponible"}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock size={15} />
                        Recogida hasta{" "}
                        {formatDate(
                          offer.pickupDeadlineUtc,
                          offer.establishment.timeZoneId
                        )}
                      </p>
                      <p className="font-semibold text-[#214A31]">
                        {offer.availableQuantity} unidades disponibles
                      </p>
                    </div>

                    <button
                      onClick={() => void openDetails(offer)}
                      className="mt-5 w-full rounded-xl bg-[#214A31] py-3 text-sm font-bold text-white transition hover:bg-[#103625]"
                    >
                      Ver detalles
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {hasNextPage && !loading && !demoMode && (
          <div className="mt-8 text-center">
            <button
              disabled={loadingMore}
              onClick={() => void loadOffers(page + 1, true)}
              className="rounded-xl border border-[#214A31] px-6 py-3 font-bold text-[#214A31] transition hover:bg-[#E2EBCB] disabled:opacity-50"
            >
              {loadingMore ? "Cargando..." : "Cargar más ofertas"}
            </button>
          </div>
        )}
      </section>

      <section id="como-funciona" className="bg-[#E2EBCB] px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-[#78954A]">
              Simple y sostenible
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-[#214A31]">
              ¿Cómo funciona XFood?
            </h2>
          </div>

          <div className="mt-10 grid gap-8 text-center md:grid-cols-3">
            {[
              [
                "Encuentra",
                "Busca alimentos disponibles cerca de tu ubicación.",
              ],
              [
                "Explora",
                "Compara opciones, precios y condiciones de recogida.",
              ],
              [
                "Aprovecha",
                "Reduce el desperdicio y ahorra en tus compras.",
              ],
            ].map(([title, description], index) => (
              <div key={title}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#214A31]">
                  {index === 0 ? (
                    <MapPin size={26} />
                  ) : index === 1 ? (
                    <Search size={26} />
                  ) : (
                    <ShoppingBasket size={26} />
                  )}
                </div>
                <h3 className="mt-4 font-bold text-[#214A31]">
                  {index + 1}. {title}
                </h3>
                <p className="mt-2 text-sm text-[#65716A]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#103625] px-5 py-8 text-center text-sm text-white/70">
        <p className="font-bold text-white">XFood © 2026</p>
        <p className="mt-2">
          Aprovechando alimentos, construyendo un futuro mejor.
        </p>
      </footer>

      {selectedOffer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedOffer(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="offer-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-[#78954A]">
                  Detalles de la oferta
                </p>
                <h3
                  id="offer-title"
                  className="mt-1 text-2xl font-bold text-[#214A31]"
                >
                  {selectedOffer.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="rounded-lg px-3 py-1 text-xl text-[#65716A] hover:bg-[#F8F8F3]"
                aria-label="Cerrar detalles"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-[#65716A]">
              {selectedOffer.establishment.name}
            </p>

            <div className="my-5 space-y-3 rounded-xl bg-[#F8F8F3] p-4 text-sm">
              <p>
                Dirección:{" "}
                <strong>{selectedOffer.establishment.address}</strong>
              </p>
              <p>
                Precio:{" "}
                <strong>
                  {formatPrice(
                    selectedOffer.discountedUnitPrice,
                    selectedOffer.currency
                  )}
                </strong>
              </p>
              <p>
                Disponibilidad:{" "}
                <strong>{selectedOffer.availableQuantity} unidades</strong>
              </p>
              <p>
                Recogida desde:{" "}
                <strong>
                  {formatDate(
                    selectedOffer.pickupStartsAtUtc,
                    selectedOffer.establishment.timeZoneId
                  )}
                </strong>
              </p>
              <p>
                Recogida hasta:{" "}
                <strong>
                  {formatDate(
                    selectedOffer.pickupDeadlineUtc,
                    selectedOffer.establishment.timeZoneId
                  )}
                </strong>
              </p>
              <p>
                Instrucciones:{" "}
                <strong>
                  {selectedOffer.pickupInstructions || "No especificadas"}
                </strong>
              </p>
              {selectedOffer.distanceKm !== null && (
                <p>
                  Distancia:{" "}
                  <strong>
                    {selectedOffer.distanceKm.toFixed(1)} km
                  </strong>
                </p>
              )}
            </div>

            <p className="text-sm text-[#65716A]">
              {selectedOffer.description}
            </p>

            <button
              onClick={() => setSelectedOffer(null)}
              className="mt-5 w-full rounded-xl bg-[#214A31] py-3 font-bold text-white hover:bg-[#103625]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
