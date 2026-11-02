import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-10 py-4 bg-white/60 backdrop-blur-lg border-b border-gray-200/50 transition-all">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Leaf className="h-7 w-7 text-[#214a31] fill-[#214a31]" />
        <span className="text-2xl font-extrabold text-[#103625] tracking-tight">XFood</span>
      </Link>

      {/* Enlaces centrales */}
      <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-gray-800">
        <Link href="/" className="hover:text-[#7aa943] transition-colors">Inicio</Link>
        <Link href="/como-funciona" className="hover:text-[#7aa943] transition-colors">Cómo funciona</Link>
        <Link href="/negocios" className="hover:text-[#7aa943] transition-colors">Para negocios</Link>
        <Link href="/impacto" className="hover:text-[#7aa943] transition-colors">Impacto</Link>
        <Link href="/nosotros" className="hover:text-[#7aa943] transition-colors">Nosotros</Link>
      </div>

      {/* Botón de acción */}
      <div>
        <Link 
          href="/login" 
          className="bg-[#e2ebcb] hover:bg-[#c7ea67] text-[#103625] px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
        >
          Iniciar sesión
        </Link>
      </div>
    </nav>
  );
}