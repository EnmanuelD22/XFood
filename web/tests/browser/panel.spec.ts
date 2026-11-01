import { test, expect, type Page } from "@playwright/test";

const establishmentId = "11111111-1111-1111-1111-111111111111";
const categoryId = "22222222-2222-2222-2222-222222222222";
const sale = {
  id: "33333333-3333-3333-3333-333333333333", establishmentId, categoryId,
  title: "Canasta de frutas", description: "Frutas disponibles para recoger hoy", mode: 1, status: 1,
  initialQuantity: 5, availableQuantity: 5, originalUnitPrice: 200.75, discountedUnitPrice: 129.75,
  currency: "DOP", pickupInstructions: "Recoger en caja", paymentInstructions: "Pago al recoger",
  foodSafetyDeclared: true, isFoodFit: true, pickupStartsAtUtc: "2035-06-01T14:00:00Z",
  pickupDeadlineUtc: "2035-06-01T18:00:00Z", createdAtUtc: "2035-06-01T12:00:00Z",
};
async function mockApi(page: Page, signedIn = true) {
  let listings = [{ ...sale }];
  await page.route("**/api/v1/**", async route => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    if (path.endsWith("/me")) return route.fulfill({ status: signedIn ? 200 : 401, json: signedIn
      ? { role: "Establishment", status: "Active", establishments: [{ id: establishmentId, name: "Mercado Verde", status: "Active", memberRole: "Owner", isPrimary: true }] }
      : { code: "UNAUTHENTICATED", message: "Inicia sesión" } });
    if (path.endsWith("/categories")) return route.fulfill({ json: [{ id: categoryId, name: "Frutas y verduras" }] });
    if (path.endsWith(`/establishments/${establishmentId}`)) return route.fulfill({ json: { latitude: 18.5, longitude: -69.9, timeZoneId: "America/Santo_Domingo" } });
    if (path.endsWith("/deactivate")) {
      listings = listings.map(item => ({ ...item, status: 3 }));
      return route.fulfill({ json: listings[0] });
    }
    if (method === "PATCH" || method === "POST") {
      listings = [{ ...sale, ...route.request().postDataJSON() }];
      return route.fulfill({ json: listings[0] });
    }
    if (path.includes("/establishments/") && path.endsWith("/listings")) return route.fulfill({ json: listings });
    if (path.endsWith("/search-options")) return route.fulfill({ json: { defaultRadiusKm: 3, maxResults: 100, defaultPageSize: 20, radiiKm: [1, 3, 5, 10] } });
    return route.fulfill({ json: listings, headers: { "X-Has-Next-Page": "false" } });
  });
}

test("renders API cents, filters and opens an accessible editing dialog", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: sale.title })).toBeVisible();
  await page.screenshot({ path: "test-results/panel-desktop.png", fullPage: true, animations: "disabled" });
  await expect(page.locator("article")).toContainText("129.75");
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Título", { exact: false }).fill("Nueva canasta");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("heading", { name: "Nueva canasta" })).toBeVisible();
  await page.getByRole("textbox", { name: "Buscar publicaciones" }).fill("sin coincidencias");
  await expect(page.getByRole("heading", { name: "No hay coincidencias" })).toBeVisible();
});

test("creates a sale with the API contract and shows the saved result", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Publicar excedente" }).click();
  await page.getByLabel("Título", { exact: false }).fill("Nueva venta");
  await page.getByLabel("Descripción", { exact: false }).fill("Alimentos aptos para recoger");
  await page.getByLabel("Categoría", { exact: false }).selectOption(categoryId);
  await page.getByLabel("Precio original", { exact: false }).fill("200.75");
  await page.getByLabel("Precio con descuento", { exact: false }).fill("129.75");
  await page.getByLabel("Indicaciones de recogida", { exact: false }).fill("Recoger en caja");
  await page.getByLabel("Inicio de recogida", { exact: false }).fill("2035-06-01T10:00");
  await page.getByLabel("Límite de recogida", { exact: false }).fill("2035-06-01T14:00");
  await page.getByRole("checkbox").check();
  const request = page.waitForRequest(req => req.method() === "POST" && req.url().endsWith("/api/v1/listings"));
  await page.getByRole("dialog").getByRole("button", { name: "Publicar excedente" }).click();
  const payload = (await request).postDataJSON();
  expect(payload.establishmentId).toBe(establishmentId);
  expect(payload.foodSafetyDeclared).toBe(true);
  expect(payload.pickupStartsAtUtc).toBe("2035-06-01T14:00:00.000Z");
  await expect(page.getByRole("heading", { name: "Nueva venta" })).toBeVisible();
});

test("keeps server validation errors associated with the field", async ({ page }) => {
  await mockApi(page);
  await page.route(`**/api/v1/listings/${sale.id}`, route => route.fulfill({ status: 400,
    json: { code: "VALIDATION_ERROR", message: "Revisa el formulario", errors: { Title: ["Título rechazado por la API"] } } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Título rechazado por la API")).toBeVisible();
  await expect(page.getByLabel("Título", { exact: false })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("deactivation requires a reason and preserves history", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Desactivar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirmar desactivación" })).toBeDisabled();
  await page.getByLabel("Motivo de desactivación").fill("Retirada del lote");
  await page.getByRole("button", { name: "Confirmar desactivación" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("article")).toContainText("Desactivada");
});

test("session is required to create and no misleading empty CTA is shown", async ({ page }) => {
  await mockApi(page, false);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Acceso para establecimientos" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publicar excedente" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Crear primera publicación" })).toHaveCount(0);
});

test("switching establishment ignores a late response from the previous selection", async ({ page }) => {
  await mockApi(page);
  const secondId = "44444444-4444-4444-4444-444444444444";
  await page.route("**/api/v1/me", route => route.fulfill({ json: {
    role: "Establishment", status: "Active", establishments: [establishmentId, secondId].map((id, index) => ({
      id, name: `Local ${index + 1}`, status: "Active", memberRole: "Owner", isPrimary: index === 0,
    })),
  } }));
  await page.route(`**/api/v1/establishments/${establishmentId}`, async route => {
    await new Promise(resolve => setTimeout(resolve, 700));
    await route.fulfill({ json: { latitude: 18.5, longitude: -69.9, timeZoneId: "America/Santo_Domingo" } });
  });
  await page.route(`**/api/v1/establishments/${secondId}`, route => route.fulfill({ json: {
    latitude: 18.6, longitude: -69.8, timeZoneId: "America/Santo_Domingo",
  } }));
  await page.route(`**/api/v1/establishments/${secondId}/listings`, route => route.fulfill({ json: [
    { ...sale, establishmentId: secondId, title: "Oferta del segundo local" },
  ] }));
  const firstProfile = page.waitForRequest(req => req.url().endsWith(`/establishments/${establishmentId}`));
  await page.goto("/");
  await firstProfile;
  await page.getByLabel("Establecimiento", { exact: true }).selectOption(secondId);
  await expect(page.getByRole("heading", { name: "Oferta del segundo local" })).toBeVisible();
  await page.waitForTimeout(800); // Permitir que la respuesta anterior llegue después de la selección nueva.
  await expect(page.getByRole("heading", { name: "Oferta del segundo local" })).toBeVisible();
  await expect(page.getByRole("heading", { name: sale.title })).toHaveCount(0);
});

test("mobile layout supports reduced motion, focus containment and Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockApi(page);
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Publicar excedente" });
  await expect(page.getByRole("heading", { name: sale.title })).toBeVisible();
  await page.screenshot({ path: "test-results/panel-mobile.png", fullPage: true, animations: "disabled" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest("dialog")))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.getByRole("dialog").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await page.screenshot({ path: "test-results/panel-mobile-dialog.png", fullPage: true, animations: "disabled" });
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});
