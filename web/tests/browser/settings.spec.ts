import { test, expect, type Page } from "@playwright/test";

const establishmentId = "11111111-1111-1111-1111-111111111111";
const account = {
  id: "a1", email: "pan@ejemplo.com", displayName: "Luis Pérez", role: "Establishment", status: "Active", organization: null,
  establishments: [{ id: establishmentId, name: "Panadería Central", status: "Active", memberRole: "Owner", isPrimary: true }],
};
const profile = {
  id: establishmentId, name: "Panadería Central", contactName: "Luis Pérez", contactEmail: "pan@ejemplo.com", contactPhone: "809-555-0102",
  address: "Av. Duarte 10", latitude: 18.4861, longitude: -69.9312, timeZoneId: "America/Santo_Domingo",
};

async function mockPanel(page: Page, onPut?: (body: Record<string, unknown>) => { status: number; json: object }) {
  const puts: Record<string, unknown>[] = [];
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    if (url.pathname.endsWith("/me")) return route.fulfill({ json: account });
    if (url.pathname.endsWith("/categories")) {
      return route.fulfill({ json: [
        { id: "49130876-893d-4204-9b94-4a588d487544", name: "Frutas y verduras", isActive: true },
        { id: "99999999-0000-0000-0000-000000000000", name: "Bebidas", isActive: true },
        { id: "88888888-0000-0000-0000-000000000000", name: "Retirada", isActive: false },
      ] });
    }
    if (url.pathname.endsWith(`/establishments/${establishmentId}`)) {
      if (method === "PUT") {
        const body = route.request().postDataJSON();
        puts.push(body);
        const answer = onPut?.(body) ?? { status: 200, json: { ...profile, ...body } };
        return route.fulfill(answer);
      }
      return route.fulfill({ json: profile });
    }
    return route.fulfill({ json: [] });
  });
  return puts;
}

test("the category catalog shows active categories with illustrative images and a placeholder", async ({ page }) => {
  await mockPanel(page);
  await page.goto("/panel/categorias");
  await expect(page.getByRole("heading", { name: "Categorías", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Categorías" })).toHaveAttribute("aria-current", "page");
  const items = page.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 2 }) });
  await expect(items).toHaveCount(2);
  await expect(items.filter({ hasText: "Frutas y verduras" }).getByText("Imagen ilustrativa de la categoría")).toBeVisible();
  await expect(items.filter({ hasText: "Bebidas" }).locator("img")).toHaveAttribute("src", "/images/categories/sin-imagen.svg");
  await expect(page.getByText("Retirada")).toHaveCount(0);
  await page.screenshot({ path: "test-results/panel-categories.png", fullPage: true, animations: "disabled" });
});

test("settings load the profile and save it with the PUT contract", async ({ page }) => {
  const puts = await mockPanel(page);
  await page.goto("/panel/configuracion");
  const name = page.getByLabel("Nombre del establecimiento");
  await expect(name).toHaveValue("Panadería Central");
  await expect(page.getByText("America/Santo_Domingo")).toBeVisible();
  await page.screenshot({ path: "test-results/panel-settings.png", fullPage: true, animations: "disabled" });
  await name.fill("Panadería Central Norte");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Los datos del establecimiento se guardaron.")).toBeVisible();
  expect(puts).toHaveLength(1);
  expect(puts[0]).toEqual({
    name: "Panadería Central Norte", contactName: "Luis Pérez", contactEmail: "pan@ejemplo.com", contactPhone: "809-555-0102",
    address: "Av. Duarte 10", latitude: 18.4861, longitude: -69.9312,
  });
});

test("settings show server validation next to the field", async ({ page }) => {
  await mockPanel(page, () => ({ status: 400, json: { code: "VALIDATION_ERROR", message: "Revisa los datos", traceId: "t",
    errors: { ContactEmail: ["El correo de contacto no tiene un formato válido."] } } }));
  await page.goto("/panel/configuracion");
  await expect(page.getByLabel("Nombre del establecimiento")).toHaveValue("Panadería Central");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("El correo de contacto no tiene un formato válido.")).toBeVisible();
  await expect(page.getByLabel("Correo de contacto")).toHaveAttribute("aria-invalid", "true");
});

test("a concurrent edit reloads the latest profile and explains why", async ({ page }) => {
  await mockPanel(page, () => ({ status: 409, json: { code: "CONFLICT", message: "Conflicto", traceId: "t" } }));
  await page.goto("/panel/configuracion");
  await page.getByLabel("Nombre del establecimiento").fill("Otro nombre");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByLabel("Nombre del establecimiento")).toHaveValue("Panadería Central");
  await expect(page.getByText(/Otra persona actualizó el perfil/)).toBeVisible();
});
