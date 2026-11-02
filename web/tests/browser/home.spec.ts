import { test, expect, type Page } from "@playwright/test";

async function anonymous(page: Page) {
  await page.route("**/api/v1/**", (route) => route.fulfill({ status: 401, json: { code: "UNAUTHENTICATED", message: "Inicia sesión" } }));
}

test("the home page presents XFood with working section links", async ({ page }) => {
  await anonymous(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Buena comida también puede tener/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Buscar ofertas cerca" })).toHaveAttribute("href", "/buscar");
  for (const id of ["como-funciona", "negocios", "impacto"]) await expect(page.locator(`#${id}`)).toBeAttached();
  await expect(page.getByRole("heading", { level: 2, name: "Categorías aprobadas" })).toBeVisible();
  await expect(page.locator("#contenido figure")).toHaveCount(7);
  await expect(page.getByRole("banner").getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
  await page.screenshot({ path: "test-results/home-desktop.png", fullPage: true, animations: "disabled" });
});

test("the business call to action opens the registration with the establishment role", async ({ page }) => {
  await anonymous(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Crear cuenta de establecimiento" }).click();
  await expect(page).toHaveURL(/\/registro\?rol=establecimiento$/);
  await expect(page.getByRole("radio", { name: /Establecimiento/ })).toBeChecked();
  await expect(page.getByLabel("Nombre del establecimiento")).toBeVisible();
});

test("on mobile the navigation opens from the menu button and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await anonymous(page);
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Abrir menú" });
  await menu.click();
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Para negocios" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/home-mobile.png", fullPage: true, animations: "disabled" });
});
