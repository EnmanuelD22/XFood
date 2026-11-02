import Navbar from "../../features/components/Navbar";
import LoginForm from "../../features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex relative">
      {/* Barra de navegación superior */}
      <Navbar />

      {/* Mitad Izquierda - Banner Promocional Premium */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 py-12 overflow-hidden">
        {/* Imagen de fondo con ligero zoom */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('/bg-food.jpg')" }}
        />
        
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#103625]/95 via-[#214a31]/80 to-transparent" />

        <div className="relative z-20 max-w-xl mt-12 text-white">
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
            Buena comida <br />
            también puede <br />
            tener un mejor <br />
            <span className="text-[#c7ea67]">mañana</span>
          </h1>
          <p className="mt-6 text-xl text-gray-200 font-medium">
            Aprovechemos los alimentos juntos.
          </p>
          
          {/* Tarjetas informativas con efecto cristal (Glassmorphism) */}
          <div className="mt-12 flex flex-col gap-4">
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-fit transition-transform hover:-translate-y-1 cursor-default">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#c7ea67] text-[#103625] text-xl shadow-sm">
                🌱
              </div>
              <span className="font-semibold text-white tracking-wide text-base">Menos desperdicio</span>
            </div>
            
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-fit transition-transform hover:-translate-y-1 cursor-default">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#c7ea67] text-[#103625] text-xl shadow-sm">
                🤝
              </div>
              <span className="font-semibold text-white tracking-wide text-base">Más comunidad</span>
            </div>

            <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-fit transition-transform hover:-translate-y-1 cursor-default">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#c7ea67] text-[#103625] text-xl shadow-sm">
                🌍
              </div>
              <span className="font-semibold text-white tracking-wide text-base">Un futuro más sostenible</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mitad Derecha - Formulario */}
      <section className="w-full lg:w-1/2 flex items-center justify-center bg-[#F8F9F5] p-6 overflow-y-auto pt-24">
        <LoginForm />
      </section>
    </main>
  );
}