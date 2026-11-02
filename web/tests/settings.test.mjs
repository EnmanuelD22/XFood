import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeProfileErrors, toProfileForm, toProfileRequest, validateProfile } from "../features/settings/profile.ts";

const profile = {
  id: "e1", name: "Panadería Central", contactName: "Luis", contactEmail: "pan@ejemplo.com", contactPhone: "809-555-0102",
  address: "Av. Duarte 10", latitude: 18.4861, longitude: -69.9312, timeZoneId: "America/Santo_Domingo",
};

test("the edit form keeps only the fields the API accepts in PUT", () => {
  const form = toProfileForm(profile);
  assert.equal("id" in form, false);
  assert.equal("timeZoneId" in form, false);
  assert.deepEqual(validateProfile(form), {});
});

test("profile validation follows the server rules", () => {
  const errors = validateProfile({ ...toProfileForm(profile), name: " ", contactEmail: "sin-arroba", contactPhone: "12", latitude: 120 });
  assert.ok(errors.name);
  assert.ok(errors.contactEmail);
  assert.ok(errors.contactPhone);
  assert.ok(errors.location);
});

test("the request trims text and rounds coordinates to six decimals", () => {
  const request = toProfileRequest({ ...toProfileForm(profile), name: "  Panadería  ", latitude: 18.123456789 });
  assert.equal(request.name, "Panadería");
  assert.equal(request.latitude, 18.123457);
});

test("server keys map to form fields and coordinates to the map", () => {
  assert.deepEqual(normalizeProfileErrors({ ContactEmail: ["Inválido"], Latitude: ["Fuera de rango"] }),
    { contactEmail: ["Inválido"], location: ["Fuera de rango"] });
});
