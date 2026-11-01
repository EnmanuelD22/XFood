import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mis publicaciones | XFood",
  description: "Administra las publicaciones de excedentes de tu establecimiento en XFood.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
