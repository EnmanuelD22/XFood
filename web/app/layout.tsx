import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/** Self-hosted by next/font at build time (SIL Open Font License); the browser makes no request to Google. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "XFood · Aprovechemos los alimentos juntos",
    template: "%s | XFood",
  },
  description: "XFood conecta establecimientos con excedentes de alimentos y personas que pueden aprovecharlos a precio reducido.",
};

export const viewport: Viewport = {
  themeColor: "#103625",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
