import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildDetailPath,
  buildSearchPath,
  discountPercent,
  formatDistance,
  groupByEstablishment,
  hasNextPage,
  locationErrorMessage,
  mergeById,
  searchKey,
} from "../features/search/format.ts";

const establishment = { id: "e1", name: "Mercado Verde", address: "Calle 1", latitude: 18.48, longitude: -69.93, timeZoneId: "America/Santo_Domingo" };
const offer = (id, place = establishment) => ({ id, establishment: place });

test("search path sends the point, radius and page to the server", () => {
  const params = new URL(buildSearchPath({ latitude: 18.4861, longitude: -69.9312 }, 5, 2, 20), "http://x/").searchParams;
  assert.equal(params.get("latitude"), "18.486100");
  assert.equal(params.get("longitude"), "-69.931200");
  assert.equal(params.get("radiusKm"), "5");
  assert.equal(params.get("page"), "2");
  assert.equal(params.get("pageSize"), "20");
});
test("detail path includes the point only when there is one", () => {
  assert.equal(buildDetailPath("abc"), "listings/abc");
  assert.match(buildDetailPath("abc", { latitude: 1, longitude: 2 }), /^listings\/abc\?latitude=1\.000000&longitude=2\.000000$/);
});
test("next page header is read case-insensitively", () => {
  assert.equal(hasNextPage(new Headers({ "X-Has-Next-Page": "True" })), true);
  assert.equal(hasNextPage(new Headers({ "X-Has-Next-Page": "false" })), false);
  assert.equal(hasNextPage(new Headers()), false);
});
test("later pages do not repeat offers already shown", () => {
  const merged = mergeById([offer("a"), offer("b")], [offer("b"), offer("c"), offer("c")]);
  assert.deepEqual(merged.map((item) => item.id), ["a", "b", "c"]);
});
test("offers are grouped by establishment for the map", () => {
  const other = { ...establishment, id: "e2", name: "Panadería Sol" };
  const groups = groupByEstablishment([offer("a"), offer("b", other), offer("c")]);
  assert.deepEqual(groups.map((group) => [group.establishment.id, group.listings.length]), [["e1", 2], ["e2", 1]]);
});
test("distance uses meters below one kilometer", () => {
  assert.equal(formatDistance(0.45), "450 m");
  assert.match(formatDistance(2.46), /^2[.,]5 km$/);
  assert.equal(formatDistance(null), "");
});
test("discount needs a lower discounted price", () => {
  assert.equal(discountPercent(200, 150), 25);
  assert.equal(discountPercent(200, 200), null);
  assert.equal(discountPercent(null, 100), null);
});
test("a denied permission asks for a point on the map", () => {
  assert.match(locationErrorMessage(1), /No diste permiso/);
  assert.match(locationErrorMessage(3), /No pudimos obtener/);
  assert.match(locationErrorMessage(), /navegador/);
});
test("a new attempt or radius changes the search key", () => {
  const point = { latitude: 18.4861, longitude: -69.9312 };
  assert.equal(searchKey(point, 3, 0), searchKey({ ...point }, 3, 0));
  assert.notEqual(searchKey(point, 3, 0), searchKey(point, 5, 0));
  assert.notEqual(searchKey(point, 3, 0), searchKey(point, 3, 1));
});


test("duplicate offers keep their position and use the newest server data", () => {
  const merged = mergeById([{ ...offer("a"), availableQuantity: 5 }, offer("b")], [{ ...offer("a"), availableQuantity: 1 }]);
  assert.deepEqual(merged.map(item => item.id), ["a", "b"]);
  assert.equal(merged[0].availableQuantity, 1);
});
