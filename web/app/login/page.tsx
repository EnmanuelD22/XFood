import type { Metadata } from "next";
import { Suspense } from "react";
import { PageStatus } from "@/components/layout/PageStatus";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a XFood para publicar excedentes o encontrar ofertas de alimentos cerca de ti.",
};

export default function LoginPage() {
  return <AuthLayout>
    {/* The form reads ?next= and status flags from the URL, which only exist in the browser. */}
    <Suspense fallback={<PageStatus label="Cargando…" />}><LoginForm /></Suspense>
  </AuthLayout>;
}
