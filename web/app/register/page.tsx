import RegisterForm from "../../features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex">
      {/* Mitad Izquierda - Banner Promocional */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-[#F3F4F0] flex-col justify-center px-16 py-12">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/bg-food.jpg')" }}
        />
        <div className="relative z-10 max-w-xl mt-12">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Buena comida <br />
            también puede <br />
            tener un mejor <br />
            <span className="text-[#5B7A38]">mañana</span>
          </h1>
          <p className="mt-6 text-xl text-gray-700">
            Aprovechemos los alimentos juntos.
          </p>
          
          <div className="mt-10 flex flex-wrap gap-6 text-sm font-medium text-gray-800">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-green-100 rounded-full text-green-700">🌱</span>
              Menos desperdicio
            </div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-green-100 rounded-full text-green-700">🤝</span>
              Más comunidad
            </div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-green-100 rounded-full text-green-700">🌍</span>
              Un futuro más sostenible
            </div>
          </div>
        </div>
      </section>

      {/* Mitad Derecha - Formulario */}
      <section className="w-full lg:w-1/2 flex items-center justify-center bg-[#F8F9F5] p-6 overflow-y-auto">
        <RegisterForm />
      </section>
    </main>
  );
}