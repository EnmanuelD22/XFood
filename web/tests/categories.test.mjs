import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { categoryImageFor, PLACEHOLDER_IMAGE } from "../features/categories/category-images.ts";

const SEEDED = {
  "68de952d-7dd1-4379-bf75-1d23d6c22d41": "comidas-preparadas.svg",
  "050c7350-1685-4013-a87e-d90a888d0670": "panaderia-reposteria.svg",
  "49130876-893d-4204-9b94-4a588d487544": "frutas-verduras.svg",
  "57acbe83-c922-4b84-8afc-393c032d7055": "lacteos-huevos.svg",
  "6ccab297-9905-4751-9ac8-5ca3bde545e0": "carnes-pescados.svg",
  "ca4a3ade-7c7c-4edb-a922-1b50a10b2313": "alimentos-envasados.svg",
};

test("each approved category id has its own illustration file", () => {
  for (const [id, file] of Object.entries(SEEDED)) {
    const image = categoryImageFor(id);
    assert.deepEqual(image, { src: `/images/categories/${file}`, known: true });
    assert.ok(existsSync(new URL(`../public${image.src}`, import.meta.url)), `${file} is missing`);
  }
});

test("ids are case-insensitive and approved names work without accents", () => {
  assert.equal(categoryImageFor("CA4A3ADE-7C7C-4EDB-A922-1B50A10B2313").src, "/images/categories/alimentos-envasados.svg");
  assert.equal(categoryImageFor("otro-id", "Panaderia y Reposteria").src, "/images/categories/panaderia-reposteria.svg");
});

test("new or unknown categories use the neutral placeholder", () => {
  assert.deepEqual(categoryImageFor("nueva", "Bebidas"), { src: PLACEHOLDER_IMAGE, known: false });
  assert.deepEqual(categoryImageFor(undefined, undefined), { src: PLACEHOLDER_IMAGE, known: false });
  assert.ok(existsSync(new URL(`../public${PLACEHOLDER_IMAGE}`, import.meta.url)));
});

test("illustrations are self-contained SVGs with fixed dimensions", () => {
  for (const file of [...Object.values(SEEDED), "sin-imagen.svg"]) {
    const svg = readFileSync(new URL(`../public/images/categories/${file}`, import.meta.url), "utf8");
    assert.match(svg, /viewBox="0 0 320 200"/);
    assert.doesNotMatch(svg, /<image|href=|<script/i, `${file} must not load external content`);
  }
});
