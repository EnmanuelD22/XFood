import type { Metadata } from "next";
import { EstablishmentPanel } from "@/features/listings/EstablishmentPanel";

export const metadata: Metadata = {
  title: "Mis publicaciones",
  description: "Administra las publicaciones de excedentes de tu establecimiento en XFood.",
};

export default function PanelPage() {
  return <EstablishmentPanel />;
}
