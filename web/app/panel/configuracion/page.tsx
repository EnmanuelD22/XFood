import type { Metadata } from "next";
import { EstablishmentSettings } from "@/features/settings/EstablishmentSettings";

export const metadata: Metadata = {
  title: "Configuración",
  description: "Datos de contacto y ubicación de tu establecimiento en XFood.",
};

export default function SettingsPage() {
  return <EstablishmentSettings />;
}
