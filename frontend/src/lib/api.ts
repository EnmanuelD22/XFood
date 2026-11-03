
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type EstablishmentSummary = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timeZoneId: string;
};

export type Listing = {
  id: string;
  establishmentId: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  mode: string;
  status: string;
  initialQuantity: number;
  availableQuantity: number;
  originalUnitPrice: number | null;
  discountedUnitPrice: number | null;
  currency: string;
  pickupInstructions: string;
  paymentInstructions: string | null;
  foodSafetyDeclared: boolean;
  isFoodFit: boolean;
  pickupStartsAtUtc: string;
  pickupDeadlineUtc: string;
  createdAtUtc: string;
  establishment: EstablishmentSummary;
  distanceKm: number | null;
};

export type SearchOptions = {
  radiiKm: number[];
  defaultRadiusKm: number;
  maxResults: number;
  defaultPageSize: number;
};

export type ListingSearchParams = {
  search?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
};

export type ListingSearchResult = {
  listings: Listing[];
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

async function request<T>(path: string): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("No está configurada la URL de la API.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error de API: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getSearchOptions(): Promise<SearchOptions> {
  return request<SearchOptions>("/listings/search-options");
}

export async function searchListings(
  params: ListingSearchParams = {}
): Promise<ListingSearchResult> {
  const query = new URLSearchParams();

  if (params.latitude !== undefined && params.longitude !== undefined) {
    query.set("latitude", String(params.latitude));
    query.set("longitude", String(params.longitude));
  }

  if (params.radiusKm !== undefined) {
    query.set("radiusKm", String(params.radiusKm));
  }

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 20));

  const response = await fetch(
    `${API_BASE_URL}/listings?${query.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`No se pudieron cargar las ofertas (${response.status}).`);
  }

  const listings = (await response.json()) as Listing[];

  return {
    listings,
    page: Number(response.headers.get("X-Page") ?? 1),
    pageSize: Number(response.headers.get("X-Page-Size") ?? 20),
    hasNextPage: response.headers.get("X-Has-Next-Page") === "true",
  };
}

export async function getListingById(
  listingId: string,
  latitude?: number,
  longitude?: number
): Promise<Listing> {
  const query = new URLSearchParams();

  if (latitude !== undefined && longitude !== undefined) {
    query.set("latitude", String(latitude));
    query.set("longitude", String(longitude));
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";

  return request<Listing>(
    `/listings/${encodeURIComponent(listingId)}${suffix}`
  );
}
