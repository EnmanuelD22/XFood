import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { RegisterForm } from "@/features/auth/RegisterForm";
import type { RegistrableRole } from "@/features/auth/registration";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta de XFood como consumidor, establecimiento u organización.",
};

const ROLE_PARAMS: Record<string, RegistrableRole> = {
  consumidor: "Consumer",
  establecimiento: "Establishment",
  organizacion: "Organization",
};

export default async function RegisterPage({ searchParams }: PageProps<"/registro">) {
  const { rol } = await searchParams;
  return <AuthLayout wide>
    <RegisterForm initialRole={typeof rol === "string" ? ROLE_PARAMS[rol] : undefined} />
  </AuthLayout>;
}
