import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMoney, getListingStatus, localInputToUtc, localInputFromUtc, mapServerErrors } from "../features/listings/format.ts";
import { formatShortDateTime } from "../lib/format.ts";

test("prices retain cents", () => {
  assert.match(formatMoney(129.75), /129[.,]75/);
});
test("expired active and exhausted lots are shown as expired", () => {
  assert.equal(getListingStatus(1, "2020-01-01T00:00:00Z"), "Vencida");
  assert.equal(getListingStatus(2, "2020-01-01T00:00:00Z"), "Vencida");
  assert.equal(getListingStatus(3, "2020-01-01T00:00:00Z"), "Desactivada");
});
test("pickup dates use the establishment timezone", () => {
  const utc = localInputToUtc("2030-06-01T10:30", "America/Santo_Domingo");
  assert.equal(utc, "2030-06-01T14:30:00.000Z");
  assert.equal(localInputFromUtc(utc, "America/Santo_Domingo"), "2030-06-01T10:30");
  assert.equal(localInputToUtc("", "America/Santo_Domingo"), "");
});
test("server field errors map to form inputs", () => {
  assert.deepEqual(mapServerErrors({ PickupStartsAtUtc: ["Horario inválido"], CategoryId: ["Inactiva"] }),
    { pickupDeadline: ["Horario inválido"], categoryId: ["Inactiva"] });
});

test("short pickup times say today or tomorrow in the establishment timezone", () => {
  const now = new Date("2030-06-01T15:00:00Z"); // 11:00 a. m. in Santo Domingo
  assert.match(formatShortDateTime("2030-06-02T00:00:00Z", "America/Santo_Domingo", now), /^hoy, 8:00/);
  assert.match(formatShortDateTime("2030-06-02T14:30:00Z", "America/Santo_Domingo", now), /^mañana, 10:30/);
  assert.match(formatShortDateTime("2030-06-05T18:00:00Z", "America/Santo_Domingo", now), /^5 jun, 2:00/);
});
