import { test, expect, type Page } from "@playwright/test";

const establishmentAccount = {
  id: "a1", email: "panaderia@ejemplo.com", displayName: "Panadería Central", role: "Establishment", status: "Active", organization: null,
  establishments: [{ id: "11111111-1111-1111-1111-111111111111", name: "Panadería Central", status: "Active", memberRole: "Owner", isPrimary: true }],
};
const consumerAccount = { id: "c1", email: "ana@ejemplo.com", displayName: "Ana", role: "Consumer", status: "Active", organization: null, establishments: null };

type AuthMock = {
  account?: object;
  loginStatus?: number;
  loginBody?: object;
  /** Simulates a browser that rejects the cookie, so /me keeps answering 401 after a successful login. */
  cookieStored?: boolean;
  startSignedIn?: boolean;
  logoutStatus?: number;
};

async function mockAuth(page: Page, { account = establishmentAccount, loginStatus = 200, loginBody, cookieStored = true, startSignedIn = false, logoutStatus = 204 }: AuthMock = {}) {
  const calls: string[] = [];
  let signedIn = startSignedIn;
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    calls.push(`${method} ${url.pathname}`);
    if (url.pathname.endsWith("/auth/login")) {
      if (loginStatus === 200) signedIn = cookieStored;
      return route.fulfill({ status: loginStatus, json: loginBody ?? account });
    }
    if (url.pathname.endsWith("/auth/logout")) {
      if (logoutStatus !== 204) return route.fulfill({ status: logoutStatus, json: { code: "ERROR", message: "La API no respondió", traceId: "t" } });
      signedIn = false;
      return route.fulfill({ status: 204 });
    }
    if (url.pathname.endsWith("/me")) {
      return signedIn
        ? route.fulfill({ json: account })
        : route.fulfill({ status: 401, json: { code: "UNAUTHENTICATED", message: "Inicia sesión" } });
    }
    if (url.pathname.endsWith("/categories")) return route.fulfill({ json: [] });
    if (url.pathname.includes("/establishments/") && url.pathname.endsWith("/listings")) return route.fulfill({ json: [] });
    if (url.pathname.includes("/establishments/")) return route.fulfill({ json: { latitude: 18.5, longitude: -69.9, timeZoneId: "America/Santo_Domingo" } });
    if (url.pathname.endsWith("/search-options")) return route.fulfill({ json: { radiiKm: [1, 3], defaultRadiusKm: 3, maxResults: 50, defaultPageSize: 20 } });
    return route.fulfill({ json: [], headers: { "X-Has-Next-Page": "false" } });
  });
  return calls;
}

async function fillLogin(page: Page, password = "Clave#2026") {
  await page.getByLabel("Correo electrónico").fill("panaderia@ejemplo.com");
  await page.getByRole("textbox", { name: "Contraseña", exact: true }).fill(password);
}

test("an establishment logs in, the role comes from /me and the panel opens", async ({ page }) => {
  const calls = await mockAuth(page);
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Bienvenido a XFood" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Olvidaste/ })).toHaveCount(0);
  await page.screenshot({ path: "test-results/login-desktop.png", fullPage: true, animations: "disabled" });
  await fillLogin(page);
  const request = page.waitForRequest((req) => req.method() === "POST" && req.url().endsWith("/api/v1/auth/login"));
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  expect((await request).postDataJSON()).toEqual({ email: "panaderia@ejemplo.com", password: "Clave#2026" });
  await expect(page).toHaveURL(/\/panel(\?|$)/);
  await expect(page.getByRole("heading", { name: "Mis publicaciones" })).toBeVisible();
  const loginIndex = calls.indexOf("POST /api/v1/auth/login");
  expect(calls.slice(loginIndex + 1)).toContain("GET /api/v1/me");
});

test("a consumer is sent to the search and a panel next path is ignored", async ({ page }) => {
  await mockAuth(page, { account: consumerAccount });
  await page.goto("/login?next=%2Fpanel");
  await expect(page.getByText("Inicia sesión para continuar.")).toBeVisible();
  await fillLogin(page);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/buscar$/);
});

test("the requested panel page is restored after login", async ({ page }) => {
  await mockAuth(page);
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/login\?next=%2Fpanel$/);
  await fillLogin(page);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/panel(\?|$)/);
});

test("wrong credentials are explained, the password is cleared and the email is kept", async ({ page }) => {
  await mockAuth(page, { loginStatus: 401, loginBody: { code: "INVALID_CREDENTIALS", message: "Credenciales inválidas", traceId: "t" } });
  await page.goto("/login");
  await fillLogin(page);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.locator("#formulario").getByRole("alert")).toContainText("El correo o la contraseña no son correctos");
  await expect(page.getByLabel("Correo electrónico")).toHaveValue("panaderia@ejemplo.com");
  await expect(page.getByRole("textbox", { name: "Contraseña", exact: true })).toHaveValue("");
  await expect(page).toHaveURL(/\/login$/);
});

test("a suspended account gets its own message", async ({ page }) => {
  await mockAuth(page, { loginStatus: 403, loginBody: { code: "ACCOUNT_SUSPENDED", message: "Cuenta suspendida", traceId: "t" } });
  await page.goto("/login");
  await fillLogin(page);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.locator("#formulario").getByRole("alert")).toContainText("Tu cuenta está suspendida");
});

test("a cookie the browser did not store is reported instead of looping", async ({ page }) => {
  await mockAuth(page, { cookieStored: false });
  await page.goto("/login");
  await fillLogin(page);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.locator("#formulario").getByRole("alert")).toContainText("no guardó la cookie de sesión");
  await expect(page).toHaveURL(/\/login$/);
});

test("client validation is linked to the fields and the password can be revealed", async ({ page }) => {
  await mockAuth(page);
  await page.goto("/login");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  const email = page.getByLabel("Correo electrónico");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toBeFocused();
  await expect(page.getByText("Escribe un correo electrónico válido.")).toBeVisible();
  const password = page.getByRole("textbox", { name: "Contraseña", exact: true });
  await password.fill("secreta");
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Mostrar contraseña" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(page.getByRole("button", { name: "Ocultar contraseña" })).toHaveAttribute("aria-pressed", "true");
});

test("mobile login has no horizontal scroll and works with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockAuth(page);
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Bienvenido a XFood" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/login-mobile.png", fullPage: true, animations: "disabled" });
});

test("an establishment registers with its location and is sent to the login", async ({ page }) => {
  await mockAuth(page);
  await page.route("**/api/v1/auth/register", (route) => route.fulfill({ status: 201, json: establishmentAccount }));
  await page.goto("/registro");
  await page.getByRole("radio", { name: /Establecimiento/ }).check();
  await page.getByLabel("Nombre de la persona responsable").fill("Luis Pérez");
  await page.getByLabel("Correo electrónico").fill("pan@ejemplo.com");
  await page.getByRole("textbox", { name: "Contraseña", exact: true }).fill("Clave#2026");
  await page.getByLabel("Nombre del establecimiento").fill("Panadería Central");
  await page.getByLabel("Teléfono de contacto").fill("809-555-0102");
  await page.getByLabel("Dirección").fill("Av. Duarte 10");
  await page.getByRole("button", { name: "Usar el centro del mapa" }).click();
  await expect(page.getByText(/Ubicación marcada: 18\.4861/)).toBeVisible();
  await page.screenshot({ path: "test-results/register-establishment.png", fullPage: true, animations: "disabled" });
  const request = page.waitForRequest((req) => req.method() === "POST" && req.url().endsWith("/api/v1/auth/register"));
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  const body = (await request).postDataJSON();
  expect(body).toMatchObject({ email: "pan@ejemplo.com", displayName: "Luis Pérez", role: "Establishment",
    establishment: { name: "Panadería Central", contactPhone: "809-555-0102", address: "Av. Duarte 10" } });
  expect(body.establishment.latitude).toBeCloseTo(18.4861, 4);
  expect(body.organization).toBeUndefined();
  await expect(page).toHaveURL(/\/login\?registro=ok$/);
  await expect(page.getByText("Cuenta creada")).toBeVisible();
});

test("registration without a location points to the map and keeps the request unsent", async ({ page }) => {
  const calls = await mockAuth(page);
  await page.goto("/registro");
  await page.getByRole("radio", { name: /Establecimiento/ }).check();
  await page.getByLabel("Nombre de la persona responsable").fill("Luis Pérez");
  await page.getByLabel("Correo electrónico").fill("pan@ejemplo.com");
  await page.getByRole("textbox", { name: "Contraseña", exact: true }).fill("Clave#2026");
  await page.getByLabel("Nombre del establecimiento").fill("Panadería Central");
  await page.getByLabel("Teléfono de contacto").fill("809-555-0102");
  await page.getByLabel("Dirección").fill("Av. Duarte 10");
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(page.getByText("Marca la ubicación del establecimiento en el mapa.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Mapa para ubicar el establecimiento" })).toHaveAccessibleDescription(/Marca la ubicación/);
  expect(calls).not.toContain("POST /api/v1/auth/register");
});

test("server validation errors stay next to their fields", async ({ page }) => {
  await mockAuth(page);
  await page.route("**/api/v1/auth/register", (route) => route.fulfill({ status: 400, json: {
    code: "VALIDATION_ERROR", message: "Revisa los datos", traceId: "t",
    errors: { email: ["Ya existe una cuenta con este correo."], password: ["La contraseña debe incluir al menos un símbolo."] },
  } }));
  await page.goto("/registro");
  await page.getByLabel("Nombre completo").fill("Ana");
  await page.getByLabel("Correo electrónico").fill("ana@ejemplo.com");
  await page.getByRole("textbox", { name: "Contraseña", exact: true }).fill("Clave2026");
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(page.getByText("Ya existe una cuenta con este correo.")).toBeVisible();
  await expect(page.getByLabel("Correo electrónico")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Correo electrónico")).toBeFocused();
  await expect(page.getByText("La contraseña debe incluir al menos un símbolo.")).toBeVisible();
  await expect(page).toHaveURL(/\/registro$/);
});

test("an organization registers and the login mentions the pending verification", async ({ page }) => {
  await mockAuth(page);
  await page.route("**/api/v1/auth/register", (route) => route.fulfill({ status: 201, json: {} }));
  await page.goto("/registro");
  await page.getByRole("radio", { name: /Organización/ }).check();
  await page.getByLabel("Nombre de la persona responsable").fill("Rosa");
  await page.getByLabel("Correo electrónico").fill("rosa@ejemplo.com");
  await page.getByRole("textbox", { name: "Contraseña", exact: true }).fill("Clave#2026");
  await page.getByLabel("Nombre de la organización").fill("Banco de Alimentos");
  await page.getByLabel("Teléfono de contacto").fill("8095550000");
  await page.getByLabel("Dirección").fill("Calle 1");
  const request = page.waitForRequest((req) => req.method() === "POST" && req.url().endsWith("/api/v1/auth/register"));
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  const body = (await request).postDataJSON();
  expect(body.organization).toMatchObject({ name: "Banco de Alimentos" });
  expect(body.establishment).toBeUndefined();
  await expect(page.getByText(/pendiente de verificación/)).toBeVisible();
});

test("signing out from the panel ends the session and the panel asks for login again", async ({ page }) => {
  const calls = await mockAuth(page, { startSignedIn: true });
  await page.goto("/panel");
  await expect(page.getByRole("heading", { name: "Mis publicaciones" })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login\?sesion=cerrada$/);
  await expect(page.getByText("Cerraste sesión correctamente.")).toBeVisible();
  expect(calls).toContain("POST /api/v1/auth/logout");
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/login\?next=%2Fpanel$/);
});

test("the public header shows the session and lets a consumer sign out", async ({ page }) => {
  await mockAuth(page, { account: consumerAccount, startSignedIn: true });
  await page.goto("/buscar");
  await expect(page.getByText("Sesión iniciada como Ana")).toBeAttached();
  await expect(page.getByRole("banner").getByRole("link", { name: "Iniciar sesión" })).toHaveCount(0);
  await page.getByRole("banner").getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login\?sesion=cerrada$/);
});

test("a failed sign-out is reported and keeps the person in the panel", async ({ page }) => {
  await mockAuth(page, { startSignedIn: true, logoutStatus: 500 });
  await page.goto("/panel");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.locator("#contenido").getByRole("alert")).toContainText("La API no respondió");
  await expect(page).toHaveURL(/\/panel/);
});

test("an organization sees its verification status", async ({ page }) => {
  await mockAuth(page, { startSignedIn: true, account: {
    id: "o1", email: "rosa@ejemplo.com", displayName: "Rosa", role: "Organization", status: "Active", establishments: null,
    organization: { id: "org", name: "Banco de Alimentos", verificationStatus: "Pending" },
  } });
  await page.goto("/organizacion");
  await expect(page.getByRole("heading", { name: "Banco de Alimentos" })).toBeVisible();
  await expect(page.getByText("Pendiente de verificación")).toBeVisible();
});

test("an establishment cannot open the organization page", async ({ page }) => {
  await mockAuth(page, { startSignedIn: true });
  await page.goto("/organizacion");
  await expect(page.getByRole("heading", { name: "No tienes acceso a esta sección" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ir a mi inicio" })).toHaveAttribute("href", "/panel");
});
