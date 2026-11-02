/**
 * Single source for category illustrations. They are original SVGs owned by the project
 * (web/public/images/categories) and always shown as illustrative, never as a photo of the lot.
 *
 * Keys are the ids seeded by the `SeedInitialCategories` migration. The form keeps sending the ids
 * the API returns; this table only chooses a picture.
 */
export type CategoryImage = { src: string; known: boolean };

const BASE_PATH = "/images/categories";

export const PLACEHOLDER_IMAGE = `${BASE_PATH}/sin-imagen.svg`;

const BY_ID: Record<string, string> = {
  "68de952d-7dd1-4379-bf75-1d23d6c22d41": "comidas-preparadas.svg",
  "050c7350-1685-4013-a87e-d90a888d0670": "panaderia-reposteria.svg",
  "49130876-893d-4204-9b94-4a588d487544": "frutas-verduras.svg",
  "57acbe83-c922-4b84-8afc-393c032d7055": "lacteos-huevos.svg",
  "6ccab297-9905-4751-9ac8-5ca3bde545e0": "carnes-pescados.svg",
  "ca4a3ade-7c7c-4edb-a922-1b50a10b2313": "alimentos-envasados.svg",
};

/** Fallback for environments whose catalog was created with other ids but the approved names. */
const BY_NAME: Record<string, string> = {
  "comidas preparadas": "comidas-preparadas.svg",
  "panaderia y reposteria": "panaderia-reposteria.svg",
  "frutas y verduras": "frutas-verduras.svg",
  "lacteos y huevos": "lacteos-huevos.svg",
  "carnes y pescados": "carnes-pescados.svg",
  "alimentos envasados": "alimentos-envasados.svg",
};

function normalizeName(name: string) {
  return name.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLocaleLowerCase("es");
}

/** New or unknown categories get the neutral placeholder instead of a misleading picture. */
export function categoryImageFor(categoryId?: string | null, categoryName?: string | null): CategoryImage {
  const file = (categoryId && BY_ID[categoryId.toLowerCase()]) || (categoryName && BY_NAME[normalizeName(categoryName)]);
  return file ? { src: `${BASE_PATH}/${file}`, known: true } : { src: PLACEHOLDER_IMAGE, known: false };
}
