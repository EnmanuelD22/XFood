import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { RegisterForm } from "@/features/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta de XFood como consumidor, establecimiento u organización.",
};

export default function RegisterPage() {
  return <AuthLayout wide headerActions={<ButtonLink href="/login" variant="soft" size="sm">Iniciar sesión</ButtonLink>}>
    <RegisterForm />
  </AuthLayout>;
}
