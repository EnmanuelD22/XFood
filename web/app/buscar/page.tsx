import type { Metadata } from "next";
import { ListingSearch } from "@/features/search/ListingSearch";

export const metadata: Metadata = {
  title: "Buscar ofertas | XFood",
  description: "Encuentra ofertas de alimentos a precio reducido cerca de tu ubicación y sus condiciones de recogida.",
};

export default function SearchPage() {
  return <ListingSearch />;
}
