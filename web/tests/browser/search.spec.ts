import { test, expect, type Page, type Route } from "@playwright/test";

const consumer = { latitude: 18.4861, longitude: -69.9312 };
const establishment = {
  id: "11111111-1111-1111-1111-111111111111", name: "Mercado Verde", address: "Av. Independencia 25, Santo Domingo",
  latitude: 18.49, longitude: -69.93, timeZoneId: "America/Santo_Domingo",
};
const sale = {
  id: "33333333-3333-3333-3333-333333333333", establishmentId: establishment.id, categoryId: "22222222-2222-2222-2222-222222222222",
  categoryName: "Frutas y verduras", title: "Canasta de frutas", description: "Frutas disponibles para recoger hoy", mode: 1, status: 1,
  initialQuantity: 5, availableQuantity: 5, originalUnitPrice: 200.75, discountedUnitPrice: 129.75, currency: "DOP",
  pickupInstructions: "Recoger en caja", paymentInstructions: "Pago al recoger", foodSafetyDeclared: true, isFoodFit: true,
  pickupStartsAtUtc: "2035-06-01T14:00:00Z", pickupDeadlineUtc: "2035-06-01T18:00:00Z", createdAtUtc: "2035-06-01T12:00:00Z",
  establishment, distanceKm: 0.45,
};
const secondSale = { ...sale, id: "44444444-4444-4444-4444-444444444444", title: "Pan del día", categoryName: "Panadería", distanceKm: 1.2 };
const searchOptions = { radiiKm: [1, 3, 5, 10], defaultRadiusKm: 3, maxResults: 100, defaultPageSize: 20 };

type SearchHandler = (params: URLSearchParams, route: Route) => Promise<void>;

async function stubGeolocation(page: Page, mode: "granted" | "denied") {
  await page.addInitScript(({ granted, point }) => {
    const geolocation = {
      getCurrentPosition(success: PositionCallback, error?: PositionErrorCallback | null) {
        setTimeout(() => granted
          ? success({ coords: { latitude: point.latitude, longitude: point.longitude, accuracy: 10 } } as GeolocationPosition)
          : error?.({ code: 1, message: "Permiso denegado" } as GeolocationPositionError), 0);
      },
      watchPosition: () => 0,
      clearWatch: () => undefined,
    };
    Object.defineProperty(navigator, "geolocation", { value: geolocation, configurable: true });
  }, { granted: mode === "granted", point: consumer });
}

async function mockApi(page: Page, onSearch?: SearchHandler) {
  const searches: URLSearchParams[] = [];
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/listings/search-options")) return route.fulfill({ json: searchOptions });
    if (url.pathname.endsWith(`/listings/${sale.id}`)) return route.fulfill({ json: sale });
    if (url.pathname.endsWith("/listings")) {
      searches.push(url.searchParams);
      if (onSearch) return onSearch(url.searchParams, route);
      return route.fulfill({ json: [sale], headers: { "X-Page": "1", "X-Page-Size": "20", "X-Has-Next-Page": "false" } });
    }
    return route.fulfill({ status: 404, json: { code: "NOT_FOUND", message: "No encontrado" } });
  });
  return searches;
}

test("granted location shows nearby offers on the map and the list with the default radius", async ({ page }) => {
  await stubGeolocation(page, "granted");
  const searches = await mockApi(page);
  await page.goto("/buscar");
  await expect(page.getByRole("heading", { name: sale.title })).toBeVisible();
  expect(searches[0].get("radiusKm")).toBe("3");
  expect(Number(searches[0].get("latitude"))).toBeCloseTo(consumer.latitude, 4);
  await expect(page.getByTitle("Mercado Verde: 1 oferta")).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Radio de búsqueda" })).toHaveValue("3");
  await expect(page.getByText("OpenStreetMap")).toBeVisible();
  const card = page.getByRole("article").filter({ hasText: sale.title });
  await expect(card.getByText("Imagen ilustrativa de la categoría")).toBeVisible();
  await expect(card.locator("figure img")).toHaveAttribute("src", "/images/categories/frutas-verduras.svg");
  await page.screenshot({ path: "test-results/search-desktop.png", fullPage: true, animations: "disabled" });
});

test("changing the radius asks the server again with the selected value", async ({ page }) => {
  await stubGeolocation(page, "granted");
  const searches = await mockApi(page);
  await page.goto("/buscar");
  await expect(page.getByRole("heading", { name: sale.title })).toBeVisible();
  const request = page.waitForRequest((req) => req.url().includes("radiusKm=5"));
  await page.getByRole("combobox", { name: "Radio de búsqueda" }).selectOption("5");
  await request;
  expect(searches.at(-1)?.get("radiusKm")).toBe("5");
});

test("the detail shows establishment, pickup window, prices and availability without a reserve action", async ({ page }) => {
  await stubGeolocation(page, "granted");
  await mockApi(page);
  await page.goto("/buscar");
  await page.getByRole("button", { name: `Ver detalle de ${sale.title}` }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(establishment.name);
  await expect(dialog).toContainText(establishment.address);
  await expect(dialog).toContainText("Recoger en caja");
  await expect(dialog).toContainText("129.75");
  await expect(dialog).toContainText("5 unidades disponibles");
  await expect(dialog.getByRole("button", { name: /reservar/i })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("denied permission lets the consumer pick a point on the map", async ({ page }) => {
  await stubGeolocation(page, "denied");
  const searches = await mockApi(page);
  await page.goto("/buscar");
  await expect(page.getByRole("heading", { name: "Elige un punto en el mapa" })).toBeVisible();
  expect(searches).toHaveLength(0);
  await page.getByRole("region", { name: "Mapa de ofertas cercanas" }).click();
  await expect(page.getByRole("heading", { name: sale.title })).toBeVisible();
  expect(searches[0].get("latitude")).not.toBeNull();
  await expect(page.getByText("Buscando cerca del punto elegido en el mapa.")).toBeVisible();
});

test("the map keeps Leaflet's classes when the point arrives and picking is toggled", async ({ page }) => {
  await stubGeolocation(page, "granted");
  await mockApi(page);
  await page.goto("/buscar");
  const map = page.getByRole("region", { name: "Mapa de ofertas cercanas" });
  await expect(page.getByTitle("Mercado Verde: 1 oferta")).toBeVisible();
  await expect(map).toHaveClass(/leaflet-container/);
  await page.getByRole("button", { name: "Elegir en el mapa" }).click();
  await expect(page.getByRole("button", { name: "Cancelar selección" })).toBeVisible();
  await expect(map).toHaveClass(/leaflet-container/);
  await expect(map.locator("path.leaflet-interactive, svg path")).not.toHaveCount(0);
});

test("an offer that is no longer available is reported and searched again", async ({ page }) => {
  await stubGeolocation(page, "granted");
  const searches = await mockApi(page);
  await page.route((url) => url.pathname.endsWith(`/api/v1/listings/${sale.id}`), (route) => route.fulfill({ status: 404, json: { code: "NOT_FOUND", message: "No disponible" } }));
  await page.goto("/buscar");
  await page.getByRole("button", { name: `Ver detalle de ${sale.title}` }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("ya no está disponible");
  await expect.poll(() => searches.length).toBe(2);
});

test("shows the empty state and recovers from a failed search", async ({ page }) => {
  await stubGeolocation(page, "granted");
  let calls = 0;
  await mockApi(page, async (_params, route) => {
    calls += 1;
    if (calls === 1) return route.fulfill({ status: 500, json: { code: "SERVER_ERROR", message: "Error del servidor" } });
    return route.fulfill({ json: [], headers: { "X-Has-Next-Page": "false" } });
  });
  await page.goto("/buscar");
  await expect(page.getByRole("heading", { name: "No pudimos cargar las ofertas" })).toBeVisible();
  await page.getByRole("button", { name: "Volver a intentar" }).click();
  await expect(page.getByRole("heading", { name: "No hay ofertas en este radio" })).toBeVisible();
});

test("loads the next page and skips offers that were already shown", async ({ page }) => {
  await stubGeolocation(page, "granted");
  await mockApi(page, async (params, route) => {
    const firstPage = params.get("page") === "1";
    return route.fulfill({ json: firstPage ? [sale] : [sale, secondSale], headers: { "X-Has-Next-Page": firstPage ? "true" : "false" } });
  });
  await page.goto("/buscar");
  await page.getByRole("button", { name: "Cargar más ofertas" }).click();
  await expect(page.getByRole("heading", { name: secondSale.title })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Ver detalle de/ })).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Cargar más ofertas" })).toHaveCount(0);
});


test("manual location can be selected using only keyboard controls", async ({ page }) => {
  await stubGeolocation(page, "denied");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const searches = await mockApi(page);
  await page.goto("/buscar");
  const map = page.getByRole("region", { name: "Mapa de ofertas cercanas" });
  await map.focus();
  await page.keyboard.press("ArrowRight");
  const choose = page.getByRole("button", { name: "Buscar desde el centro del mapa" });
  await choose.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: sale.title })).toBeVisible();
  expect(searches).toHaveLength(1);
  expect(Number(searches[0].get("longitude"))).toBeGreaterThanOrEqual(-180);
  expect(Number(searches[0].get("longitude"))).toBeLessThanOrEqual(180);
});

test("a late GPS response cannot replace a manually selected point", async ({ page }) => {
  await page.addInitScript(point => {
    let calls = 0;
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: {
      getCurrentPosition(success: PositionCallback) {
        calls += 1;
        setTimeout(() => success({ coords: { ...point, accuracy: 10 } } as GeolocationPosition), calls === 1 ? 0 : 1000);
      },
    } });
  }, consumer);
  await mockApi(page);
  await page.goto("/buscar");
  await expect(page.getByRole("heading", { name: sale.title })).toBeVisible();
  await page.getByRole("button", { name: "Usar mi ubicación" }).click();
  await page.getByRole("button", { name: "Elegir en el mapa" }).click();
  await page.getByRole("button", { name: "Buscar desde el centro del mapa" }).click();
  await page.waitForTimeout(1200); // La respuesta GPS debe llegar después de la elección manual.
  await expect(page.getByText("Buscando cerca del punto elegido en el mapa.")).toBeVisible();
});

test("a failed detail request does not present cached stock as confirmed", async ({ page }) => {
  await stubGeolocation(page, "granted");
  await mockApi(page);
  await page.route((url) => url.pathname.endsWith(`/api/v1/listings/${sale.id}`), route => route.fulfill({
    status: 503, json: { code: "API_UNAVAILABLE", message: "No se pudo comprobar la oferta" },
  }));
  await page.goto("/buscar");
  await page.getByRole("button", { name: `Ver detalle de ${sale.title}` }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("alert")).toContainText("No se pudo comprobar");
  await expect(dialog.getByText("5 unidades disponibles")).toHaveCount(0);
});


test("changing radius cancels a pending next page and keeps the mobile results consistent", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stubGeolocation(page, "granted");
  await mockApi(page, async (params, route) => {
    if (params.get("page") === "2") {
      await new Promise(resolve => setTimeout(resolve, 700));
      return route.fulfill({ json: [secondSale], headers: { "X-Has-Next-Page": "false" } });
    }
    const newRadius = params.get("radiusKm") === "5";
    return route.fulfill({ json: newRadius ? [{ ...sale, title: "Oferta del radio nuevo" }] : [sale],
      headers: { "X-Has-Next-Page": newRadius ? "false" : "true" } });
  });
  await page.goto("/buscar");
  const pending = page.waitForRequest(req => new URL(req.url()).searchParams.get("page") === "2");
  await page.getByRole("button", { name: "Cargar más ofertas" }).click();
  const request = await pending;
  const cancelled = page.waitForEvent("requestfailed", { predicate: item => item === request });
  await page.getByRole("combobox", { name: "Radio de búsqueda" }).selectOption("5");
  await cancelled;
  await expect(page.getByRole("heading", { name: "Oferta del radio nuevo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: secondSale.title })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/search-mobile.png", fullPage: true, animations: "disabled" });
});
