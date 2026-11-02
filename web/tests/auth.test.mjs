import { test } from "node:test";
import assert from "node:assert/strict";
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

test("after login the requested page is kept only when the role may open it", () => {
  assert.equal(postLoginPath({ role: "Establishment" }, "/panel/categorias"), "/panel/categorias");
  assert.equal(postLoginPath({ role: "Consumer" }, "/panel"), "/buscar");
  assert.equal(postLoginPath({ role: "Consumer" }, "/buscar?radio=5"), "/buscar?radio=5");
  assert.equal(postLoginPath({ role: "Establishment" }, "//evil.example"), "/panel");
  assert.equal(postLoginPath({ role: "Establishment" }, "/login"), "/panel");
  assert.equal(loginPathFor("/panel?x=1"), "/login?next=%2Fpanel%3Fx%3D1");
});
