import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRegisterRequest, EMPTY_REGISTRATION, normalizeServerErrors, validateRegistration } from "../features/auth/registration.ts";
import { homePathFor, isSafeInternalPath, loginPathFor, postLoginPath, requiredRoleFor } from "../features/auth/routing.ts";

test("each role lands on its own home", () => {
  assert.equal(homePathFor({ role: "Establishment" }), "/panel");
  assert.equal(homePathFor({ role: "Consumer" }), "/buscar");
  assert.equal(homePathFor({ role: "Organization" }), "/organizacion");
  assert.equal(homePathFor({ role: "Administrator" }), "/acceso-denegado");
});

test("restricted sections declare the role they need", () => {
  assert.equal(requiredRoleFor("/panel"), "Establishment");
  assert.equal(requiredRoleFor("/panel/configuracion"), "Establishment");
  assert.equal(requiredRoleFor("/panelito"), undefined);
  assert.equal(requiredRoleFor("/buscar"), undefined);
});

test("next only accepts same-site relative paths", () => {
  assert.equal(isSafeInternalPath("/panel"), true);
  assert.equal(isSafeInternalPath("//evil.example"), false);
  assert.equal(isSafeInternalPath("https://evil.example"), false);
  assert.equal(isSafeInternalPath("/\\evil.example"), false);
  assert.equal(isSafeInternalPath(null), false);
});

test("next rejects control characters and encoded network paths", () => {
  for (const path of ["/\n/evil.example", "/\t/evil.example", "/%2f%2fevil.example", "/%5cevil.example", "/%0a/evil.example", "/%invalid"]) {
    assert.equal(isSafeInternalPath(path), false, path);
    assert.equal(postLoginPath({ role: "Establishment" }, path), "/panel");
  }
  assert.equal(postLoginPath({ role: "Consumer" }, "/buscar/../panel/configuracion"), "/buscar");
  assert.equal(postLoginPath({ role: "Consumer" }, "/%70anel/configuracion"), "/buscar");
});

test("registration rejects coordinates outside the geographic range", () => {
  const values = { ...EMPTY_REGISTRATION, role: "Establishment", displayName: "Luis", email: "pan@ejemplo.com", password: "Clave#2026",
    name: "Panadería", contactPhone: "8095550102", address: "Calle 1", latitude: 18.5, longitude: -69.9 };
  for (const invalid of [{ latitude: 91 }, { longitude: -181 }, { latitude: NaN }, { longitude: Infinity }]) {
    assert.ok(validateRegistration({ ...values, ...invalid })["establishment.location"]);
  }
});

test("after login the requested page is kept only when the role may open it", () => {
  assert.equal(postLoginPath({ role: "Establishment" }, "/panel/categorias"), "/panel/categorias");
  assert.equal(postLoginPath({ role: "Consumer" }, "/panel"), "/buscar");
  assert.equal(postLoginPath({ role: "Consumer" }, "/buscar?radio=5"), "/buscar?radio=5");
  assert.equal(postLoginPath({ role: "Establishment" }, "//evil.example"), "/panel");
  assert.equal(postLoginPath({ role: "Establishment" }, "/login"), "/panel");
  assert.equal(loginPathFor("/panel?x=1"), "/login?next=%2Fpanel%3Fx%3D1");
});

test("a consumer only needs the account fields", () => {
  const values = { ...EMPTY_REGISTRATION, displayName: "Ana", email: "ana@ejemplo.com", password: "Clave#2026" };
  assert.deepEqual(validateRegistration(values), {});
  assert.deepEqual(buildRegisterRequest(values), { email: "ana@ejemplo.com", password: "Clave#2026", displayName: "Ana", role: "Consumer" });
});

test("an establishment must send its profile and a location", () => {
  const values = { ...EMPTY_REGISTRATION, role: "Establishment", displayName: "Luis", email: "pan@ejemplo.com", password: "Clave#2026" };
  const errors = validateRegistration(values);
  assert.ok(errors["establishment.name"]);
  assert.ok(errors["establishment.contactPhone"]);
  assert.ok(errors["establishment.address"]);
  assert.ok(errors["establishment.location"]);

  const complete = { ...values, name: " Panadería Central ", contactPhone: "809-555-0102", address: "Av. Duarte 10", latitude: 18.48612345, longitude: -69.9312 };
  assert.deepEqual(validateRegistration(complete), {});
  const request = buildRegisterRequest(complete);
  assert.equal(request.organization, undefined);
  assert.deepEqual(request.establishment, { name: "Panadería Central", contactPhone: "809-555-0102", address: "Av. Duarte 10", latitude: 18.486123, longitude: -69.9312 });
});

test("an organization sends its own block and omits empty verification data", () => {
  const request = buildRegisterRequest({ ...EMPTY_REGISTRATION, role: "Organization", displayName: "Rosa", email: "o@ejemplo.com", password: "x",
    name: "Banco de Alimentos", contactPhone: "8095550000", address: "Calle 1" });
  assert.equal(request.establishment, undefined);
  assert.deepEqual(request.organization, { name: "Banco de Alimentos", contactPhone: "8095550000", address: "Calle 1", verificationInformation: undefined });
});

test("server error keys are normalized and coordinates point to the map", () => {
  assert.deepEqual(normalizeServerErrors({ Email: ["Ya existe"], "Establishment.Latitude": ["Fuera de rango"], "establishment.longitude": ["Falta"] }),
    { email: ["Ya existe"], "establishment.location": ["Fuera de rango", "Falta"] });
});
