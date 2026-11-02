import type { Metadata } from "next";
import { CategoryCatalog } from "@/features/categories/CategoryCatalog";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Catálogo de categorías aprobadas para publicar excedentes en XFood.",
};

export default function CategoriesPage() {
  return <CategoryCatalog />;
}
