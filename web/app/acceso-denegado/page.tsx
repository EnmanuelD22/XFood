import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { AccessDenied } from "@/features/auth/AccessDenied";

export const metadata: Metadata = {
  title: "Acceso no disponible",
  robots: { index: false },
};

export default function AccessDeniedPage() {
  return <>
    <PublicHeader />
    <main id="contenido"><AccessDenied /></main>
  </>;
}
