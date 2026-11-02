import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { localInputFromUtc } from "../../features/listings/format";

// Este recorrido escribe datos. Usar Run-WebCrudSmoke.ps1 o scripts/ci/container-smoke.sh;
// ambos preparan un entorno aislado con una base XFood_WebTests_<guid>.
test.beforeAll(() => {
  if (!/^XFood_WebTests_[a-f0-9]{32}$/.test(process.env.XFOOD_REAL_TEST_DATABASE ?? "")) {
    throw new Error("Usa Run-WebCrudSmoke.ps1 o container-smoke.sh; se exige una base temporal aislada.");
  }
});

test("registro → login → crear → consultar → editar → búsqueda → desactivar → logout, con SQL Server real", async ({ page, context }) => {
  const clientErrors: string[] = [];
  page.on("pageerror", error => clientErrors.push(error.message));
  page.on("console", message => { if (message.type() === "error" && /hydrat/i.test(message.text())) clientErrors.push(message.text()); });
  const email = `crud-${randomUUID()}@example.test`;
  const password = `Prueba#${randomUUID()}aA1`;
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 18.4861, longitude: -69.9312 });
  await page.route("https://tile.openstreetmap.org/**", route => route.abort());
  // No se intercepta ni simula ninguna respuesta de /api/v1.
  await page.goto("/registro");
  await page.getByRole("radio", { name: /Establecimiento/ }).check();
  await page.getByLabel("Nombre de la persona responsable").fill("Responsable de prueba");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByRole("textbox", { name: "Contraseña", exact: true }).fill(password);
  await page.getByLabel("Nombre del establecimiento").fill("Mercado de integración");
  await page.getByLabel("Teléfono de contacto").fill("809-555-0101");
  await page.getByLabel("Dirección").fill("Calle de prueba 1, Santo Domingo");
  await page.getByRole("button", { name: "Usar el centro del mapa" }).click();
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?registro=ok/);
  expect((await page.request.get("/api/v1/me")).status()).toBe(401);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByRole("textbox", { name: "Contraseña", exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Mis publicaciones" })).toBeVisible();
  const cookie = (await context.cookies()).find(item => item.name === "XFood.Session");
  expect(cookie).toMatchObject({ secure: true, httpOnly: true, sameSite: "Lax" });

  await page.goto("/panel/configuracion");
  await page.getByLabel("Nombre del establecimiento").fill("Mercado actualizado");
  await page.getByLabel("Dirección").fill("Calle de prueba 2, Santo Domingo");
  await page.getByRole("button", { name: "Guardar cambios", exact: true }).click();
  await expect(page.getByText("Los datos del establecimiento se guardaron.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Nombre del establecimiento")).toHaveValue("Mercado actualizado");
  await page.goto("/panel/categorias");
  await expect(page.getByRole("heading", { name: "Frutas y verduras", exact: true })).toBeVisible();
  await page.goto("/panel");
  await page.getByRole("button", { name: "Publicar excedente", exact: true }).click();
  await page.getByLabel("Título", { exact: false }).fill("Canasta de integración");
  await page.getByLabel("Descripción", { exact: false }).fill("Alimentos aptos del recorrido de prueba.");
  await page.getByLabel("Categoría", { exact: false }).selectOption({ label: "Frutas y verduras" });
  await page.getByLabel("Cantidad inicial", { exact: false }).fill("5");
  await page.getByLabel("Precio original", { exact: false }).fill("200.75");
  await page.getByLabel("Precio con descuento", { exact: false }).fill("129.75");
  await page.getByLabel("Indicaciones de recogida", { exact: false }).fill("Recoger en caja");
  const now = Date.now();
  await page.getByLabel("Inicio de recogida", { exact: false }).fill(localInputFromUtc(new Date(now + 600000).toISOString(), "America/Santo_Domingo"));
  await page.getByLabel("Límite de recogida", { exact: false }).fill(localInputFromUtc(new Date(now + 14400000).toISOString(), "America/Santo_Domingo"));
  await page.getByRole("checkbox").check();
  const createResponse = page.waitForResponse(res => res.request().method() === "POST" && new URL(res.url()).pathname === "/api/v1/listings");
  await page.getByRole("dialog").getByRole("button", { name: "Publicar excedente", exact: true }).click();
  const created = await createResponse;
  expect(created.status()).toBe(201);
  const listing = await created.json();
  await expect(page.getByRole("heading", { name: "Canasta de integración", exact: true })).toBeVisible();
  await page.reload(); // Comprobar persistencia real al volver a consultar.
  await expect(page.getByRole("heading", { name: "Canasta de integración", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByLabel("Título", { exact: false }).fill("Canasta actualizada");
  await page.getByLabel("Precio con descuento", { exact: false }).fill("119.25");
  await page.getByRole("button", { name: "Guardar cambios", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Canasta actualizada", exact: true })).toBeVisible();
  await expect(page.locator("article")).toContainText("119.25");
  await page.screenshot({ path: "test-results/real/panel-crud.png", fullPage: true, animations: "disabled" });

  await page.goto("/buscar");
  await expect(page.getByRole("heading", { name: "Canasta actualizada", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ver detalle de Canasta actualizada" }).click();
  await expect(page.getByRole("dialog")).toContainText("Calle de prueba 2");
  await expect(page.getByRole("dialog")).toContainText("119.25");
  await page.keyboard.press("Escape");
  await page.goto("/panel");
  await page.getByRole("button", { name: "Más acciones para Canasta actualizada" }).click();
  await page.getByRole("menuitem", { name: "Desactivar", exact: true }).click();
  await page.getByLabel("Motivo de desactivación").fill("Cierre de prueba de integración");
  await page.getByRole("button", { name: "Confirmar desactivación" }).click();
  await expect(page.locator("article")).toContainText("Desactivada");
  const publicList = await page.request.get("/api/v1/listings?latitude=18.4861&longitude=-69.9312&radiusKm=3");
  expect(publicList.status()).toBe(200);
  expect((await publicList.json()).some((item: { id: string }) => item.id === listing.id)).toBe(false);
  await page.reload();
  await expect(page.locator("article")).toContainText("Desactivada");
  await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  expect((await page.request.get("/api/v1/me")).status()).toBe(401);
  await page.goto("/panel"); await expect(page).toHaveURL(/\/login/);
  expect(clientErrors).toEqual([]);
});
