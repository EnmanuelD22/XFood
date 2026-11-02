import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";

const establishmentId = "11111111-1111-1111-1111-111111111111";
const account = {
  id: "a1", email: "pan@ejemplo.com", displayName: "Luis Pérez", role: "Establishment", status: "Active", organization: null,
  establishments: [{ id: establishmentId, name: "Panadería Central", status: "Active", memberRole: "Owner", isPrimary: true }],
};
const listing = {
  id: "33333333-3333-3333-3333-333333333333", establishmentId, categoryId: "49130876-893d-4204-9b94-4a588d487544",
  title: "Canasta de frutas", description: "Frutas para hoy", mode: 1, status: 1, initialQuantity: 5, availableQuantity: 5,
  originalUnitPrice: 200, discountedUnitPrice: 120, currency: "DOP", pickupInstructions: "Caja", paymentInstructions: "Efectivo",
  foodSafetyDeclared: true, isFoodFit: true, pickupStartsAtUtc: "2035-06-01T14:00:00Z", pickupDeadlineUtc: "2035-06-01T18:00:00Z",
  createdAtUtc: "2035-06-01T12:00:00Z",
};
const profile = {
  id: establishmentId, name: "Panadería Central", contactName: "Luis", contactEmail: "pan@ejemplo.com", contactPhone: "8095550102",
  address: "Av. Duarte 10", latitude: 18.4861, longitude: -69.9312, timeZoneId: "America/Santo_Domingo",
};

async function mockApi(page: Page, signedIn: boolean) {
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: {
      getCurrentPosition: (ok: PositionCallback) => setTimeout(() => ok({ coords: { latitude: 18.4861, longitude: -69.9312, accuracy: 10 } } as GeolocationPosition), 0),
      watchPosition: () => 0, clearWatch: () => undefined,
    } });
  });
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/me")) return signedIn ? route.fulfill({ json: account }) : route.fulfill({ status: 401, json: { code: "UNAUTHENTICATED" } });
    if (path.endsWith("/categories")) return route.fulfill({ json: [{ id: listing.categoryId, name: "Frutas y verduras" }] });
    if (path.endsWith("/search-options")) return route.fulfill({ json: { radiiKm: [1, 3, 5], defaultRadiusKm: 3, maxResults: 50, defaultPageSize: 20 } });
    if (path.endsWith(`/establishments/${establishmentId}`)) return route.fulfill({ json: profile });
    if (path.endsWith(`/establishments/${establishmentId}/listings`)) return route.fulfill({ json: [listing] });
    if (path.endsWith("/listings")) {
      return route.fulfill({ json: [{ ...listing, categoryName: "Frutas y verduras", distanceKm: 0.4,
        establishment: { id: establishmentId, name: "Panadería Central", address: "Av. Duarte 10", latitude: 18.49, longitude: -69.93, timeZoneId: "America/Santo_Domingo" } }],
      headers: { "X-Has-Next-Page": "false" } });
    }
    return route.fulfill({ json: [] });
  });
}

const PAGES: Array<{ path: string; signedIn: boolean; ready: string }> = [
  { path: "/", signedIn: false, ready: "Buena comida también puede tener" },
  { path: "/login", signedIn: false, ready: "Bienvenido a XFood" },
  { path: "/registro?rol=establecimiento", signedIn: false, ready: "Crear cuenta" },
  { path: "/buscar", signedIn: false, ready: "Canasta de frutas" },
  { path: "/panel", signedIn: true, ready: "Canasta de frutas" },
  { path: "/panel/categorias", signedIn: true, ready: "Frutas y verduras" },
  { path: "/panel/configuracion", signedIn: true, ready: "Perfil del establecimiento" },
  { path: "/no-existe", signedIn: false, ready: "No encontramos esta página" },
];

for (const { path, signedIn, ready } of PAGES) {
  test(`${path} has no detectable WCAG A/AA violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockApi(page, signedIn);
    await page.goto(path);
    await expect(page.getByRole("heading", { name: ready }).first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Leaflet renders its own controls and attribution; they are outside this app's markup.
      .exclude(".leaflet-control-container")
      .analyze();
    expect(results.violations.map((item) => `${item.id}: ${item.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("the listing form dialog has no detectable violations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockApi(page, true);
  await page.goto("/panel");
  await page.getByRole("button", { name: "Publicar excedente" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const results = await new AxeBuilder({ page }).include("dialog").withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.map((item) => item.id)).toEqual([]);
});
