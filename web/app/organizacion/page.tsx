import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { OrganizationHome } from "@/features/organization/OrganizationHome";

export const metadata: Metadata = {
  title: "Mi organización",
  description: "Estado de verificación de tu organización en XFood.",
};

export default function OrganizationPage() {
  return <>
    <a className="skip-link" href="#contenido">Ir al contenido</a>
    <PublicHeader />
    <OrganizationHome />
  </>;
}
