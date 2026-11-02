import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { RegisterForm } from "@/features/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta de XFood como consumidor, establecimiento u organización.",
};

export default function RegisterPage() {
  return <AuthLayout wide>
    <RegisterForm />
  </AuthLayout>;
}
